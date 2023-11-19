import { walkSync } from "./util";
import fs from "fs";
import frontendConst from "./lib/frontend-const";
import routes from "./lib/routes";

const GREEN_START = "\x1b[32m";
const GREEN_END = "\x1b[0m";

// the export interface for a codegen module
type Module = {
  id: string;
  output: string;
  src: string;
  gen: (f: fs.WriteStream) => void;
};

function getLatestSrcModified(dir: string) {
  let latest = 0;
  for (const file of walkSync(dir)) {
    const mtime = fs.statSync(file).mtimeMs;
    if (mtime > latest) {
      latest = mtime;
    }
  }
  return latest;
}

function getTargetModified(path: string) {
  return fs.existsSync(path) ? fs.statSync(path).mtimeMs : 0;
}

function isStale(module: Module): boolean {
  const targetModified = getTargetModified(module.output);
  const srcModified = getLatestSrcModified(module.src);
  return srcModified >= targetModified;
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

/**
 * Execute each codegen module if any of its source files were modified more
 * recently than its output file.
 */
function exec(...modules: Module[]) {
  modules.forEach((module) => {
    if (isStale(module)) {
      console.log(`${GREEN_START}Running codegen ${module.id}${GREEN_END}`);
      rebuild(module);
    }
  });
}

exec(frontendConst, routes);
