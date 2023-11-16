import { type Request, Router } from "express";
import { buildNotePageModel } from "../../../model/note-page.js";
import { likes } from "../../../entity/likes.js";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";
import { NotePath } from "../../../util.js";

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

export default Router()
  .get("/api/notes", validateRequest(validate, "query"))
  .get(
    "/api/notes",
    async (req: Request<object, object, object, Payload>, res, next) => {
      try {
        let path;
        const parentId = req.query.id;
        if (parentId !== undefined) {
          const parentNote = await notes.selectById(parentId);
          if (parentNote === null) {
            res.status(404);
            res.json({ error: "not found" });
            return;
          }
          path = NotePath.append(parentNote.path, parentNote.id);
        } else {
          path = "";
        }
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
