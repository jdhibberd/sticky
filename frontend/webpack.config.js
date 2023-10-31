import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  entry: "./src/index.tsx",
  devtool: "inline-source-map",
  output: {
    filename: "bundle.js",
    path: path.resolve(dirname, "../backend/dist/public"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    extensionAlias: {
      ".js": [".js", ".ts", ".tsx"],
    },
  },
  module: {
    rules: [{ test: /\.(ts|tsx)$/, loader: "ts-loader" }],
  },
};
