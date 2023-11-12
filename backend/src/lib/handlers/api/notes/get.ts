import { type Request, Router } from "express";
import { buildNotePageModel } from "../../../model/note-page.js";
import { likes } from "../../../entity/likes.js";
import { notes } from "../../../entity/notes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";

type Payload = {
  path?: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    path: { type: "string", maxLength: 512, nullable: true },
  },
  additionalProperties: false,
});

export default Router()
  .get("/api/notes", validateRequest(validate, "query"))
  .get(
    "/api/notes",
    async (req: Request<object, object, object, Payload>, res, next) => {
      try {
        const path = req.query.path || "";
        const userId = process.env.USER_ID!;
        const notesByPath = await notes.selectByPath(path);
        const notesIds = notesByPath.map((note) => note.id);
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
