import { type Request, Router } from "express";
import { buildNotePageModel } from "../../../model/note-page.js";
import { likes } from "../../../entity/likes.js";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import { NotePath } from "../../../util.js";
import { checkNoteExists } from "../../../validation.js";
import { type Note } from "../../../entity/notes.js";

type Payload = {
  id?: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", nullable: true },
  },
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
  .get("/api/notes", validateRequest(validate, "query"))
  .get(
    "/api/notes",
    async (req: Request<object, object, object, Payload>, res, next) => {
      try {
        const { id } = req.query;
        const parentNote = await InterityRuleset.check(id);
        const path =
          parentNote === null
            ? ""
            : NotePath.append(parentNote.path, parentNote.id);
        const notesByPath = await notes.selectByPath(path);
        const notesIds = notesByPath.map((note) => note.id);
        const userId = process.env.USER_ID!;
        const likesByNoteIds = await likes.selectByNoteIds(userId, notesIds);
        const data = buildNotePageModel(
          path,
          notesByPath,
          likesByNoteIds,
          req.session.name,
        );
        res.json(data);
      } catch (e) {
        next(e);
      }
    },
  );
