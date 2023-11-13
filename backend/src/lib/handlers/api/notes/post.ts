import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import {
  CONTENT_MAXLEN,
  PATH_MAXLEN,
  PATH_MAXDEPTH,
} from "../../../entity/notes.js";

type Payload = {
  content: string;
  path: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    content: { type: "string", minLength: 1, maxLength: CONTENT_MAXLEN },
    path: {
      type: "string",
      maxLength: PATH_MAXLEN,
      maxPathDepth: PATH_MAXDEPTH,
    },
  },
  required: ["content", "path"],
  additionalProperties: false,
});

export default Router()
  .post("/api/notes", validateRequest(validate))
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
