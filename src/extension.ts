import * as vscode from "vscode";

class FactoryLinkProvider implements vscode.DocumentLinkProvider {
  async provideDocumentLinks(
    document: vscode.TextDocument
  ): Promise<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();

    // create(:factory_name), create :factory_name, build(:factory_name), build :factory_name パターンを検索する正規表現
    const factoryRegex =
      /(?:create|build)\s*(?:\(\s*)?:([a-zA-Z0-9_]+)(?:\s*,\s*|\s*\))?/g;
    let match;

    while ((match = factoryRegex.exec(text)) !== null) {
      const factoryName = match[1];
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      // ファクトリー定義を探す
      const factoryFile = await this.findFactoryFile(factoryName);
      if (factoryFile) {
        const link = new vscode.DocumentLink(
          range,
          vscode.Uri.file(factoryFile.fsPath)
        );
        link.tooltip = `Hold Cmd (Mac) or Ctrl (Windows) and click to jump to factory definition: ${factoryName}`;
        links.push(link);
      }
    }

    return links;
  }

  private async findFactoryFile(
    factoryName: string
  ): Promise<vscode.Uri | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return undefined;
    }

    const pattern = new vscode.RelativePattern(
      workspaceFolders[0],
      "spec/factories/**/*.rb"
    );
    const files = await vscode.workspace.findFiles(pattern);

    for (const file of files) {
      const content = await vscode.workspace.fs.readFile(file);
      const text = new TextDecoder().decode(content);
      if (text.includes(`factory :${factoryName}`)) {
        return file;
      }
    }

    return undefined;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new FactoryLinkProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { scheme: "file", language: "ruby" },
      provider
    )
  );
}

export function deactivate() {}
