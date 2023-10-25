import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import { notes } from "./lib/entity.js";
import bodyParser from "body-parser";
import { buildNoteViewData } from "./lib/note-view-data.js";

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

app.post("/api/notes", async (req, res) => {
  await notes.upsert(req.body);
  res.end();
});

app.get(
  "/api/notes",
  async (req: Request<object, object, object, { path: string }>, res) => {
    const entities = await notes.selectByPath(req.query.path);
    const data = buildNoteViewData(req.query.path, entities);
    res.json(data);
  },
);

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

app.get("/", async (req, res) => {
  res.render("home");
});

app.use((_req, res) => {
  res.status(404);
  res.render("404");
});

app.use(
  // QUIRK: express identifies error handlers as functions with 4 parameters,
  // which must all be explicitly defined even if not used.
  // https://expressjs.com/en/guide/error-handling.html
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err.message);
    res.status(500);
    res.render("500");
  },
);

app.listen(port, () => console.log("Express started"));
