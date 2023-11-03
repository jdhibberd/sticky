import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  entry: {
    app: "./src/app.tsx",
    unauth: "./src/unauth.tsx",
  },
  devtool: "inline-source-map",
  output: {
    filename: "[name].js",
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
