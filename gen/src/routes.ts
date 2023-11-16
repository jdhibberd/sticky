/**
 * Generate a module that automatically registers all discovered express
 * handlers with an express app.
 */

import fs from "fs";
import path from "path";
import { walkSync } from "./util";

const TARGET = "../backend/src/lib/routes.gen.ts";
const HANDLER_DIR = "../backend/src/lib/handlers";

const handlers = Array.from(walkSync(HANDLER_DIR));
const f = fs.createWriteStream(TARGET);

f.write(`import { type Express } from "express";\n`);
f.write(
  handlers
    .map((handler, i) => {
      const pathRelative =
        path.relative("../backend/src/lib", handler).slice(0, -3) + ".js";
      return `import handler_${i + 1} from "./${pathRelative}";`;
    })
    .join("\n"),
);
f.write(`\n\nexport default function registerHandlers(app: Express): void {\n`);
f.write(handlers.map((_, i) => `  app.use(handler_${i + 1});`).join("\n"));
f.write(`\n}\n`);
f.close();
