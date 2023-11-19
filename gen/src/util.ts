/**
 * Helper functions for defining codegens.
 */

import fs from "fs";
import path from "path";

// paths will be relative to ./build/out/gen
export const BACKEND_PATH = "../backend";
export const FRONTEND_PATH = "../frontend";

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
