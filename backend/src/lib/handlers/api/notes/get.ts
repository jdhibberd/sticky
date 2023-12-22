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
import { getCurrentUser } from "../../../auth.js";
import { users } from "../../../entity/users.js";

export default Router().get("/api/notes", async (req, res, next) => {
  try {
    const { parent } = await checkRequest(req.query);
    const path = parent === null ? "" : NotePath.append(parent.path, parent.id);
    const notesByPath = await notes.selectByPath(path);
    const authorIds = new Set(notesByPath.map((note) => note.authorId));
    const authors = await users.selectByIds([...authorIds]);
    const notesIds = notesByPath.map((note) => note.id);
    const user = await getCurrentUser(req);
    const likesByNoteIds = await likes.selectByNoteIds(user.id, notesIds);
    const data = buildNotePageModel(
      path,
      notesByPath,
      likesByNoteIds,
      authors,
      user,
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
