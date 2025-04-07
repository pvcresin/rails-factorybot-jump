import Mocha from "mocha";
import * as path from "path";

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  // Add the test file directly
  const testFile = path.resolve(__dirname, "extension.test.js");
  mocha.addFile(testFile);

  return new Promise((c, e) => {
    try {
      // Run the mocha test
      mocha.run((failures: number) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      e(err);
    }
  });
}
