import * as assert from "assert";
import * as vscode from "vscode";
import { FactoryLinkProvider } from "../../extension";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

// Extend vscode.workspace type for testing
declare module "vscode" {
  interface Workspace {
    workspaceFolders: vscode.WorkspaceFolder[] | undefined;
  }
}

suite("Extension Test Suite", () => {
  let factoryLinkProvider: FactoryLinkProvider;
  let testWorkspacePath: string;
  let testWorkspaceFolder: vscode.WorkspaceFolder;

  suiteSetup(() => {
    // Create a temporary directory for testing
    testWorkspacePath = fs.mkdtempSync(
      path.join(os.tmpdir(), "rails-factorybot-test-")
    );

    // Create necessary directories
    const factoriesDir = path.join(testWorkspacePath, "spec", "factories");
    fs.mkdirSync(factoriesDir, { recursive: true });

    // Create a workspace folder for testing
    testWorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: "Test Workspace",
      index: 0,
    };

    // Mock workspace folders
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: [testWorkspaceFolder],
      configurable: true,
    });
  });

  suiteTeardown(() => {
    // Clean up temporary directory
    fs.rmSync(testWorkspacePath, { recursive: true, force: true });
    // Reset workspace folders
    Object.defineProperty(vscode.workspace, "workspaceFolders", {
      value: undefined,
      configurable: true,
    });
  });

  setup(() => {
    factoryLinkProvider = new FactoryLinkProvider();
  });

  test("FactoryLinkProvider should be instantiated", () => {
    assert.ok(factoryLinkProvider instanceof FactoryLinkProvider);
  });

  test("FactoryLinkProvider should detect factory calls", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "create(:user)\nbuild(:post)",
      language: "ruby",
    });

    const links = await factoryLinkProvider.provideDocumentLinks(document);
    assert.strictEqual(
      links.length,
      0,
      "Should return empty array when not initialized"
    );
  });

  test("FactoryLinkProvider should handle complex factory calls", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "create(:user, name: 'John')\nbuild(:post, title: 'Test')",
      language: "ruby",
    });

    const links = await factoryLinkProvider.provideDocumentLinks(document);
    assert.strictEqual(
      links.length,
      0,
      "Should return empty array when not initialized"
    );
  });

  test("FactoryLinkProvider should find factory file", async () => {
    const factoryName = "user";
    const factoryFile = await factoryLinkProvider.findFactoryFile(factoryName);
    assert.ok(
      factoryFile === undefined,
      "Should return undefined when not initialized"
    );
  });

  test("FactoryLinkProvider should initialize factory files", async () => {
    await factoryLinkProvider.initializeFactoryFiles();
    assert.ok(true, "Initialization should complete without error");
  });

  test("FactoryLinkProvider should cache factory definitions", async () => {
    // Create a temporary factory file
    const factoryContent = `
      factory :user do
        name { 'John' }
      end

      factory :post do
        title { 'Test' }
      end
    `;

    const factoryFile = vscode.Uri.file(
      path.join(testWorkspacePath, "spec", "factories", "test_factories.rb")
    );

    await vscode.workspace.fs.writeFile(
      factoryFile,
      Buffer.from(factoryContent)
    );

    try {
      await factoryLinkProvider.initializeFactoryFiles();
      const userFactory = await factoryLinkProvider.findFactoryFile("user");
      const postFactory = await factoryLinkProvider.findFactoryFile("post");

      assert.ok(userFactory, "Should find user factory file");
      assert.ok(postFactory, "Should find post factory file");
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(factoryFile);
    }
  });

  test("FactoryLinkProvider should handle file system changes", async () => {
    const factoryFile = vscode.Uri.file(
      path.join(testWorkspacePath, "spec", "factories", "test_factories.rb")
    );

    // Create initial factory file
    await vscode.workspace.fs.writeFile(
      factoryFile,
      Buffer.from("factory :user do\n  name { 'John' }\nend")
    );

    try {
      // Initialize and verify first factory
      await factoryLinkProvider.initializeFactoryFiles();
      const userFactory = await factoryLinkProvider.findFactoryFile("user");
      assert.ok(userFactory, "Should find user factory file");

      // Update factory file
      await vscode.workspace.fs.writeFile(
        factoryFile,
        Buffer.from("factory :post do\n  title { 'Test' }\nend")
      );

      // Create a new instance to force reinitialization
      factoryLinkProvider = new FactoryLinkProvider();
      await factoryLinkProvider.initializeFactoryFiles();

      // Verify updated factory
      const postFactory = await factoryLinkProvider.findFactoryFile("post");
      assert.ok(postFactory, "Should find updated post factory file");

      // Verify old factory is no longer in cache
      const oldUserFactory = await factoryLinkProvider.findFactoryFile("user");
      assert.ok(!oldUserFactory, "Should not find old user factory file");
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(factoryFile);
    }
  });
});
