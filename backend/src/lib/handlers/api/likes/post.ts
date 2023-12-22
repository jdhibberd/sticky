import { Router } from "express";
import { likes } from "../../../entity/likes.js";
import { checkProps, checkUUID } from "../../../validation.js";
import { getCurrentUser } from "../../../auth.js";

export default Router().post("/api/likes", async (req, res, next) => {
  try {
    const { noteId } = checkRequest(req.body);
    const user = await getCurrentUser(req);
    await likes.insert(user.id, noteId);
    res.status(201);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  noteId: string;
};
function checkRequest(payload: { [k: string]: unknown }): Payload {
  checkProps("/", payload, ["noteId"]);
  checkUUID("/noteId", payload.noteId);
  return payload as Payload;
}
