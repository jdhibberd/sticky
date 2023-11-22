import { Router } from "express";
import { type Note, notes } from "../../../entity/notes.js";
import { checkNoteExists, checkProps, checkUUID } from "../../../validation.js";

export default Router().delete("/api/notes/:id", async (req, res, next) => {
  try {
    const { note } = await checkRequest(req.params);
    if (note !== null) await notes.dropRecursively(note);
    res.status(204);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  note: Note | null;
};
async function checkRequest(payload: {
  [k: string]: unknown;
}): Promise<Payload> {
  checkProps("/", payload, ["id"]);
  checkUUID("/id", payload.id);
  const note = await checkNoteExists("/id", payload.id as string);
  return { note };
}
