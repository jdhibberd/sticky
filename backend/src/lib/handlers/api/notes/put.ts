import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import { CONTENT_MAXLEN } from "../../../entity/notes.js";
import { checkNoteExists } from "../../../validation.js";
import { type Note } from "../../../entity/notes.js";

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

class InterityRuleset {
  static async check(
    parentId: string | null | undefined,
  ): Promise<Note | null> {
    return await checkNoteExists(parentId);
  }
}

export default Router()
  .put("/api/notes", validateRequest(validate))
  .put(
    "/api/notes",
    async (req: Request<object, object, Payload>, res, next) => {
      try {
        const { id, content } = req.body;
        await InterityRuleset.check(id);
        await notes.update(id, content);
        res.status(204);
        res.end();
      } catch (e) {
        next(e);
      }
    },
  );
