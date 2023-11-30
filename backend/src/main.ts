import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { authRequest } from "./lib/auth.js";
import { closeDbConnections } from "./lib/entity/db.js";
import registerHandlers from "./lib/routes.gen.js";
import { BadRequestError } from "./lib/validation.js";
import { getPage } from "./lib/html.js";

const app = express();

// middleware
app.use(express.static("./frontend/dist"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api", authRequest);
app.use("/signin", bodyParser.json());
app.use("/signup", bodyParser.json());
app.use("/api", bodyParser.json());

// app handlers
registerHandlers(app);

// server
app.use((_req, res) => {
  res.status(404);
  res.send(getPage("Not found."));
});

// QUIRK: express identifies error handlers as functions with 4 parameters,
// which must all be explicitly defined even if not used.
// https://expressjs.com/en/guide/error-handling.html

app.use(
  "/api",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (e: Error, req: Request, res: Response, next: NextFunction): void => {
    if (e instanceof BadRequestError) {
      res.status(400);
      res.json({ key: e.key ?? null, error: e.message });
      return;
    }
    console.error(e.message);
    console.error(e.stack);
    res.status(500);
    res.json({ error: true });
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.message);
  console.error(err.stack);
  res.status(500);
  res.send(getPage("Server error."));
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
