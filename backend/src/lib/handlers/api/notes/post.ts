import { Router } from "express";
import { notes, CONTENT_MAXLEN } from "../../../entity/notes.js";
import {
  checkProps,
  checkUUID,
  checkString,
  checkNoteExists,
  checkPathDepth,
} from "../../../validation.js";

export default Router().post("/api/notes", async (req, res, next) => {
  try {
    const { path, content } = await checkRequest(req.body);
    await notes.insert(path, content);
    res.status(201);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  path: string;
  content: string;
};
async function checkRequest(payload: {
  [k: string]: unknown;
}): Promise<Payload> {
  checkProps("/", payload, ["parentId", "content"]);
  checkUUID("/parentId", payload.parentId, { optional: true });
  checkString("/content", payload.content, {
    minLength: 1,
    maxLength: CONTENT_MAXLEN,
  });
  const parent = await checkNoteExists("/parentId", payload.parentId as string);
  const path = checkPathDepth("/parentId", parent);
  return { path, content: payload.content as string };
}
