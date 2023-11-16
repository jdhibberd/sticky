import { type Request, Router } from "express";
import { PATH_MAXDEPTH, notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import { CONTENT_MAXLEN } from "../../../entity/notes.js";
import { NotePath } from "../../../util.js";
import { IntegrityError } from "../../../validation.js";
import { type Note } from "../../../entity/notes.js";
import { checkNoteExists } from "../../../validation.js";

type Payload = {
  content: string;
  parentId?: string | null;
};

// QUIRK: unable to differentiate between null and undefined, so valid values
// for a nullable field are the field being present and set to null, or the
// field not being present and inferred as undefined
// https://github.com/ajv-validator/ajv/issues/2163
const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    content: { type: "string", minLength: 1, maxLength: CONTENT_MAXLEN },
    parentId: { type: "string", format: "uuid", nullable: true },
  },
  required: ["content"],
  additionalProperties: false,
});

class InterityRuleset {
  static async check(parentId: string | null | undefined): Promise<string> {
    const parentNote = await checkNoteExists(parentId);
    return this.checkPathDepth(parentNote);
  }

  private static checkPathDepth(parentNote: Note | null): string {
    if (parentNote === null) {
      // the note is being added to the root of the tree
      return "";
    }
    const path = NotePath.append(parentNote.path, parentNote.id);
    const depth = NotePath.getDepth(path);
    if (depth >= PATH_MAXDEPTH) {
      throw new IntegrityError("Note max depth exceeded.");
    }
    return path;
  }
}

export default Router()
  .post("/api/notes", validateRequest(validate))
  .post(
    "/api/notes",
    async (req: Request<object, object, Payload>, res, next) => {
      try {
        const { content, parentId } = req.body;
        const path = await InterityRuleset.check(parentId);
        await notes.insert(path, content);
        res.status(201);
        res.end();
      } catch (e) {
        next(e);
      }
    },
  );
