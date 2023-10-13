import { Connection } from "postgresql-client";
import express, { NextFunction, Request, Response } from "express";

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

app.get("/", async (_req, res) => {
  let data = await get();
  res.type("text/plain");
  res.send("Hey there\n" + data);
});

app.use((_req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("Not found");
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.type("text/plain");
  res.status(500);
  res.send("Server Error");
});

app.listen(port, () => console.log("Express started"));
