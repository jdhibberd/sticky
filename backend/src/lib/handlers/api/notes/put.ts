import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
import * as validation from "../../../validation.js";

type Payload = {
  id: string;
  content: string;
  path: string;
};

const validate = validation.compile<Payload>({
  type: "object",
  properties: {
    id: { type: "string" },
    content: { type: "string", maxLength: 160 },
    path: { type: "string", maxLength: 1024 },
  },
  required: ["id", "content", "path"],
  additionalProperties: false,
});

export default Router()
  .put("/api/notes", validation.handler(validate))
  .put(
    "/api/notes",
    async (req: Request<object, object, Payload>, res, next) => {
      try {
        await notes.upsert(req.body);
        res.status(204);
        res.end();
      } catch (e) {
        next(e);
      }
    },
  );
