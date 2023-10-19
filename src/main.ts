import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import { collections, notes } from "./lib/entity.js";
import bodyParser from "body-parser";

const port = 8080;
const app = express();

/**
 * Rendering engine
 */
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./dist/views");

/**
 * Middleware
 */
app.use(express.static("./dist/public"));
app.use("/api", bodyParser.json());

/**
 * API
 */

app.post("/api/collections", async (req, res) => {
  await collections.upsert(req.body);
  res.end();
});

app.get("/api/collections", async (req, res) => {
  const entities = await collections.select();
  res.json(entities);
});

app.put("/api/collections", async (req, res) => {
  await collections.upsert(req.body);
  res.end();
});

app.delete("/api/collections/:id", async (req, res) => {
  await collections.drop(req.params.id);
  res.end();
});

app.post("/api/notes", async (req, res) => {
  await notes.upsert(req.body);
  res.end();
});

app.get("/api/notes", async (req, res) => {
  const entities = await notes.select();
  res.json(entities);
});

app.put("/api/notes", async (req, res) => {
  await notes.upsert(req.body);
  res.end();
});

app.delete("/api/notes/:id", async (req, res) => {
  await notes.drop(req.params.id);
  res.end();
});

/**
 * Server
 */

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

/**
 * Testing:
 *
 * curl -i -X GET http://localhost:8080/api/collections
 * curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "Baz"}' http://localhost:8080/api/collections
 * curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "Foo"}' http://localhost:8080/api/collections
 * curl -i -X POST -H 'Content-Type: application/json' -d '{"id":"0a000ead-769e-419d-80fa-250f0e29d37b", "name": "Foo 2"}' http://localhost:8080/api/collections
 * curl -i -X DELETE http://localhost:8080/api/collections/56de7248-cf62-4f2e-a7ab-ddc9b1995513
 */
