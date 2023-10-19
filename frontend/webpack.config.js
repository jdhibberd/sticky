import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  entry: "./build/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(dirname, "../backend/dist/public"),
  },
};
