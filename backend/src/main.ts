import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { authRequest } from "./lib/auth.js";
import api_likes_post_handler from "./lib/handlers/api/likes/post.js";
import api_likes_delete_handler from "./lib/handlers/api/likes/delete.js";
import api_notes_get_handler from "./lib/handlers/api/notes/get.js";
import api_notes_post_handler from "./lib/handlers/api/notes/post.js";
import api_notes_put_handler from "./lib/handlers/api/notes/put.js";
import api_notes_delete_handler from "./lib/handlers/api/notes/delete.js";
import www_get_handler from "./lib/handlers/www/get.js";
import www_login_post_handler from "./lib/handlers/www/login/post.js";
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
app.use("/api", authRequest);
app.use("/login", bodyParser.json());
app.use("/api", bodyParser.json());

/**
 * API
 */

app.use(api_likes_post_handler);
app.use(api_likes_delete_handler);
app.use(api_notes_get_handler);
app.use(api_notes_post_handler);
app.use(api_notes_put_handler);
app.use(api_notes_delete_handler);
app.use(www_get_handler);
app.use(www_login_post_handler);

/**
 * Server
 */

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
