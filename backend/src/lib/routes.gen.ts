import { type Express } from "express";
import handler_1 from "./handlers/api/likes/delete.js";
import handler_2 from "./handlers/api/likes/post.js";
import handler_3 from "./handlers/api/notes/delete.js";
import handler_4 from "./handlers/api/notes/get.js";
import handler_5 from "./handlers/api/notes/post.js";
import handler_6 from "./handlers/api/notes/put.js";
import handler_7 from "./handlers/www/get.js";
import handler_8 from "./handlers/www/login/post.js";

export default function registerHandlers(app: Express): void {
  app.use(handler_1);
  app.use(handler_2);
  app.use(handler_3);
  app.use(handler_4);
  app.use(handler_5);
  app.use(handler_6);
  app.use(handler_7);
  app.use(handler_8);
}
