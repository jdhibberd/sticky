import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import { likes } from "./lib/entity/likes.js";
import { notes } from "./lib/entity/notes.js";
import bodyParser from "body-parser";
import { buildNotePageModel } from "./lib/model/note-page.js";
import cookieParser from "cookie-parser";
import * as auth from "./lib/auth.js";

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
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api", auth.handler);
app.use("/login", bodyParser.json());
app.use("/api", bodyParser.json());

/**
 * API
 */

app.post("/api/likes", async (req, res) => {
  await likes.insert(process.env.USER_ID!, req.body.noteId);
  res.status(201);
  res.end();
});

app.delete("/api/likes/:id", async (req, res) => {
  await likes.drop(process.env.USER_ID!, req.params.id);
  res.status(204);
  res.end();
});

app.post("/api/notes", async (req, res) => {
  await notes.upsert(req.body);
  res.status(201);
  res.end();
});

app.get("/api/notes", async (req, res) => {
  const path = req.query.path as string;
  const userId = process.env.USER_ID!;
  const notesByPath = await notes.selectByPath(path);
  const notesIds = notesByPath.map((note) => note.id);
  const likesByNoteIds = await likes.selectByNoteIds(userId, notesIds);
  const data = buildNotePageModel(
    path,
    notesByPath,
    likesByNoteIds,
    req.session.name,
  );
  res.json(data);
});

app.put("/api/notes", async (req, res) => {
  await notes.upsert(req.body);
  res.status(204);
  res.end();
});

app.delete("/api/notes/:id", async (req, res) => {
  const note = await notes.selectById(req.params.id);
  if (note === null) {
    res.status(404);
    res.end();
    return;
  }
  await notes.dropRecursively(note);
  res.status(204);
  res.end();
});

/**
 * Server
 */

app.get("/", async (req, res) => {
  const session = await auth.getSession(req);
  res.render(session === null ? "unauth" : "app");
});

app.post("/login", async (req, res) => {
  await auth.newSession(res, req.body.name);
  res.end();
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

app.listen(process.env.PORT, () => console.log("Express started"));
