import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
import * as validation from "../../../validation.js";

type Payload = {
  content: string;
  path: string;
};

const validate = validation.compile<Payload>({
  type: "object",
  properties: {
    content: { type: "string", maxLength: 160 },
    path: { type: "string", maxLength: 1024 },
  },
  required: ["content", "path"],
  additionalProperties: false,
});

export default Router()
  .post("/api/notes", validation.handler(validate))
  .post(
    "/api/notes",
    async (req: Request<object, object, Payload>, res, next) => {
      try {
        await notes.upsert(req.body);
        res.status(201);
        res.end();
      } catch (e) {
        next(e);
      }
    },
  );
