import { Connection } from "postgresql-client";
import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";

const connection = new Connection(
  "postgres://postgres:postgres@localhost/sticky",
);
const port = 8080;

async function get(): Promise<string> {
  await connection.connect();
  const result = await connection.query(
    "select * from collections where id = 1",
  );
  const rows: any[] = result.rows!;
  await connection.close();
  return rows[0];
}

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./dist/views");

app.use(express.static("./dist/public"));

app.get("/", async (_req, res) => {
  let data = await get();
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
