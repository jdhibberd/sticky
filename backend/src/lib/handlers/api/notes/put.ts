import { Router } from "express";
import { notes } from "../../../entity/notes.js";
import {
  checkProps,
  checkUUID,
  checkString,
  checkNoteExists,
} from "../../../validation.js";
import { CONTENT_MAXLEN } from "../../../entity/notes.js";

export default Router().put("/api/notes", async (req, res, next) => {
  try {
    const { id, content } = await checkRequest(req.body);
    await notes.update(id, content);
    res.status(204);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  id: string;
  content: string;
};
async function checkRequest(payload: {
  [k: string]: unknown;
}): Promise<Payload> {
  checkProps("/", payload, ["id", "content"]);
  checkUUID("/id", payload.id);
  checkString("/content", payload.content, {
    minLength: 1,
    maxLength: CONTENT_MAXLEN,
  });
  await checkNoteExists("/id", payload.id as string);
  return payload as Payload;
}
