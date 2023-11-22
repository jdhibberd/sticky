import { Router } from "express";
import { buildNotePageModel } from "../../../model/note-page.js";
import { likes } from "../../../entity/likes.js";
import { notes } from "../../../entity/notes.js";
import {
  checkProps,
  checkUUID,
  checkNoteExists,
  nullifyEmptyString,
} from "../../../validation.js";
import { NotePath } from "../../../util.js";
import { type Note } from "../../../entity/notes.js";

export default Router().get("/api/notes", async (req, res, next) => {
  try {
    const { parent } = await checkRequest(req.query);
    const path = parent === null ? "" : NotePath.append(parent.path, parent.id);
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
});

type Payload = {
  parent: Note | null;
};
async function checkRequest(payload: {
  [k: string]: unknown;
}): Promise<Payload> {
  checkProps("/", payload, ["id"]);
  nullifyEmptyString(payload, "id");
  checkUUID("/id", payload.id, { optional: true });
  const parent = await checkNoteExists("/id", payload.id as string);
  return { parent };
}
