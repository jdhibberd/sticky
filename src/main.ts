import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import { getTestDbValue } from "./lib/handler.js";

const port = 8080;
const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./dist/views");

app.use(express.static("./dist/public"));

app.get("/", async (_req, res) => {
  let data = await getTestDbValue();
  res.render("home", { data });
});

app.use((_req, res) => {
  res.status(404);
  res.render("404");
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500);
  res.render("500");
});

app.listen(port, () => console.log("Express started"));
