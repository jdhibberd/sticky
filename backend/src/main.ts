import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import { likes } from "./lib/entity/likes.js";
import { notes } from "./lib/entity/notes.js";
import bodyParser from "body-parser";
import { buildNotePageModel } from "./lib/model/note-page.js";
import cookieParser from "cookie-parser";
import * as auth from "./lib/auth.js";
import api_notes_post_handler from "./lib/handlers/api/notes/post.js";
import api_notes_put_handler from "./lib/handlers/api/notes/put.js";
import { closeDbConnections } from "./lib/entity/db.js";

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

app.post("/api/likes", async (req, res, next) => {
  try {
    await likes.insert(process.env.USER_ID!, req.body.noteId);
    res.status(201);
    res.end();
  } catch (e) {
    next(e);
  }
});

app.delete("/api/likes/:id", async (req, res, next) => {
  try {
    await likes.drop(process.env.USER_ID!, req.params.id);
    res.status(204);
    res.end();
  } catch (e) {
    next(e);
  }
});

app.get("/api/notes", async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
});

app.use(api_notes_post_handler);
app.use(api_notes_put_handler);

app.delete("/api/notes/:id", async (req, res, next) => {
  try {
    const note = await notes.selectById(req.params.id);
    if (note === null) {
      res.status(404);
      res.end();
      return;
    }
    await notes.dropRecursively(note);
    res.status(204);
    res.end();
  } catch (e) {
    next(e);
  }
});

/**
 * Server
 */

app.get("/", async (req, res, next) => {
  try {
    const session = await auth.getSession(req);
    res.render(session === null ? "unauth" : "app");
  } catch (e) {
    next(e);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    await auth.newSession(res, req.body.name);
    res.end();
  } catch (e) {
    next(e);
  }
});

app.use((_req, res) => {
  res.status(404);
  res.render("404");
});

// QUIRK: express identifies error handlers as functions with 4 parameters,
// which must all be explicitly defined even if not used.
// https://expressjs.com/en/guide/error-handling.html

app.use(
  "/api",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    res.json({ error: true });
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.message);
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

const server = app.listen(process.env.PORT, () =>
  console.log("Express started"),
);

function gracefulShutdown() {
  server.close(async () => {
    await closeDbConnections();
  });
  process.exit(0);
}
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
