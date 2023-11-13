import express, { NextFunction, Request, Response } from "express";
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { authRequest } from "./lib/auth.js";
import { closeDbConnections } from "./lib/entity/db.js";
import registerHandlers from "./lib/routes.gen.js";

const app = express();

// rendering engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./dist/views");

// middleware
app.use(express.static("./dist/public"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api", authRequest);
app.use("/login", bodyParser.json());
app.use("/api", bodyParser.json());

// app handlers
registerHandlers(app);

// server
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
