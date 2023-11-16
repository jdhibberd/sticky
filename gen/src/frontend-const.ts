/**
 * Generate a module that contains frontend copies of constants defined in the
 * backend codebase that have been marked for export to the frontend.
 *
 * To export a constant add a comment to the preceding line in the following
 * format:
 *
 *   // @frontend-export NS
 *   export const K = 42;
 *
 * Which would create the following constant in the frontend code:
 *
 *   const NS_K = 42;
 *
 */

import fs from "fs";
import { walkSync } from "./util";

const TARGET = "../frontend/src/lib/backend-const.gen.ts";
const ENTITY_DIR = "../backend/src/lib/entity";

const PATTERN =
  /\/\/ @frontend-export\s(?<ns>[A-Z]+)\n(export\s)?const\s(?<k>[A-Z_]+)\s=\s(?<v>[0-9]+);\n/g;

function* getConsts() {
  for (const file of walkSync(ENTITY_DIR)) {
    const content = fs.readFileSync(file, "utf8");
    for (const { groups: g } of content.matchAll(PATTERN)) {
      yield `${g!.ns}_${g!.k} = ${g!.v}`;
    }
  }
}

const f = fs.createWriteStream(TARGET);
for (const c of getConsts()) {
  f.write(`export const ${c};\n`);
}
f.close();
