import { walkSync } from "./util.js";
import fs from "fs";
import frontendConst from "./lib/frontend-const.js";
import routes from "./lib/routes.js";

const GREEN_START = "\x1b[32m";
const GREEN_END = "\x1b[0m";

// the export interface for a codegen module
type Module = {
  id: string;
  output: string;
  src: string;
  gen: (f: fs.WriteStream) => void;
};

/**
 * Execute each codegen module if any of its source files were modified more
 * recently than its output file.
 */
function main(...modules: Module[]) {
  modules.forEach((module) => {
    if (isStale(module)) {
      console.log(`${GREEN_START}Running codegen ${module.id}${GREEN_END}`);
      rebuild(module);
    }
  });
}

main(frontendConst, routes);

/**
 * Determine whether a codegen module's output file is stale (i.e. needs to be
 * rebuilt).
 *
 * A stale state is any of the following:
 *
 * - the codegen's output file doesn't yet exist
 * - the gen package has been rebuilt since the codegen's output file was last
 *   generated, which means the logic for generating it could have changed even
 *   though the codegen's source files haven't changed
 * - any of the codegen's source files have been modified more recently than
 *   the last time the output file was generated
 */
function isStale(module: Module): boolean {
  if (!fs.existsSync(module.output)) {
    return true;
  }
  const outputFileModified = fs.statSync(module.output).mtimeMs;
  const genBuildModified = fs.statSync("./dist").mtimeMs;
  if (genBuildModified >= outputFileModified) {
    return true;
  }
  const sourceModified = getLatestSrcModified(module.src);
  if (sourceModified >= outputFileModified) {
    return true;
  }
  return false;
}

/**
 * Return the most recent modification time of any file within a dir
 * recursively.
 */
function getLatestSrcModified(dir: string): number {
  let latest = 0;
  for (const file of walkSync(dir)) {
    const mtime = fs.statSync(file).mtimeMs;
    if (mtime > latest) {
      latest = mtime;
    }
  }
  return latest;
}

/**
 * Invoke a codegen module's generate function to rebuild its output file,
 * passing in a write stream for convenience.
 */
function rebuild(module: Module) {
  const f = fs.createWriteStream(module.output);
  try {
    module.gen(f);
  } finally {
    f.close();
  }
}
