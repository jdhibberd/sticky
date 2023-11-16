/**
 * Helper functions for defining codegens.
 */

import fs from "fs";
import path from "path";

/**
 * Return the paths of all files in a directory recursively.
 */
export function* walkSync(dir: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}
