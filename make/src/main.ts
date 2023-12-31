/**
 * Build the application.
 *
 * This involves running linters and typecheckers, transpiling TypeScript into
 * JavaScript, bundling JavaScript and CSS, etc.
 *
 * The application consists of multiple independent packages (e.g. 'backend',
 * 'frontend'). The build system minimises build time by caching build artefacts
 * and only rebuilding packages that have changes. It determines this using file
 * modification times and a package dependency tree.
 *
 * The build system is run by running `./build` from the root of the codebase.
 * All paths defined in this package should be relative to that location.
 *
 * Each package has its own local 'build' script that is responsible for
 * building its artefacts and storing them in a local 'dist' dir,
 * e.g. './backend/dist'. These are not committed to version control.
 *
 * Each local build script can be run with a `-t` flag to only test the package
 * for correctness (e.g. linting, formatting, testing). This mode is typically
 * used by a git commit hook.
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const GREEN_START = "\x1b[32m";
const GREEN_END = "\x1b[0m";
type Package = "backend" | "frontend" | "gen" | "make";

/**
 * Run the high-level steps required to build the application.
 *
 * Updates to the build system ("make") will only take affect the next time the
 * build command is run.
 *
 * If the `-t` cli arg is specified then all packages are built in test mode,
 * which is typically used by the pre-commit hook.
 */
async function main(): Promise<void> {
  const isTest = process.argv[2] === "-t";
  const startTime = performance.now();
  await buildPackageIfStale("make", [], isTest);
  await buildPackageIfStale("gen", [], isTest);
  await runCodegen();
  await buildPackageIfStale("backend", ["gen"], isTest);
  await buildPackageIfStale("frontend", ["gen", "backend"], isTest);
  const duration = Math.round((performance.now() - startTime) / 1000);
  log(`Build complete in ${duration}s`);
}

await main();

/**
 * Rebuild a package (e.g. frontend, backend) if it's stale.
 */
async function buildPackageIfStale(
  id: Package,
  deps: Package[],
  isTest: boolean,
) {
  if (isPackageStale(id, deps)) {
    log(`Building ${id}`);
    const cmd = isTest ? `(cd ${id} && ./build -t)` : `(cd ${id} && ./build)`;
    await execCommand(cmd);
  }
}

/**
 * Determine whether a package (e.g. frontend, backend) is stale (i.e. needs to
 * be rebuilt).
 *
 * A stale state is any of the following:
 *
 * - the package's build output hasn't yet been created
 * - the build output for any dependend packages haven't been created yet, or
 *   any of those build outputs were created more recently than the package's
 *   last build
 * - any of the package's node dependencies have been updated
 * - any of the packaage's source files were modified more recently than the
 *   last build
 *
 * Note that package-lock.json is used to determine node dependency changes
 * rather than package.json, because it contains the specific versions of
 * installed packages.
 */
function isPackageStale(id: Package, deps: Package[]): boolean {
  if (!fs.existsSync(`${id}/dist`)) {
    log(`No existing build output for ${id}`);
    return true;
  }
  const lastBuild = fs.statSync(`${id}/dist`).mtimeMs;
  for (const dep of deps) {
    if (!fs.existsSync(`${dep}/dist`)) {
      log(`Dependency ${dep} on ${id} missing`);
      return true;
    }
    if (fs.statSync(`${dep}/dist`).mtimeMs > lastBuild) {
      log(`Dependency ${dep} on ${id} updated`);
      return true;
    }
  }
  if (fs.statSync(`${id}/package-lock.json`).mtimeMs > lastBuild) {
    log(`Dependency 'package-lock.json' on ${id} updated`);
    return true;
  }
  for (const file of walkSync(`${id}/src`)) {
    if (fs.statSync(file).mtimeMs > lastBuild) {
      log(`File ${file} on ${id} updated`);
      return true;
    }
  }
  return false;
}

/**
 * Run the (built) codegen script in case any generated TypeScript modules need
 * to be updated.
 */
async function runCodegen() {
  await execCommand(`(cd gen && node ./dist/main.js)`);
}

/**
 * Execute a shell command, typically a build script for a package.
 */
function execCommand(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(`Child process exited with code ${code}`);
      }
    });
  });
}

/**
 * Return the paths of all files in a directory recursively.
 */
function* walkSync(dir: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

/**
 * Write to the console in green, to differentiate from entries made by
 * external build scripts, etc.
 */
function log(msg: string) {
  console.log(`${GREEN_START}${msg}${GREEN_END}`);
}
