import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import { CONTENT_MAXLEN } from "../../../entity/notes.js";

type Payload = {
  id: string;
  content: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    content: { type: "string", minLength: 1, maxLength: CONTENT_MAXLEN },
  },
  required: ["id", "content"],
  additionalProperties: false,
});

export default Router()
  .put("/api/notes", validateRequest(validate))
  .put(
    "/api/notes",
    async (req: Request<object, object, Payload>, res, next) => {
      try {
        const { id, content } = req.body;
        await notes.update(id, content);
        res.status(204);
        res.end();
      } catch (e) {
        next(e);
      }
    },
  );
