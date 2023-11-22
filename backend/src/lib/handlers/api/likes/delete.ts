import { Router } from "express";
import { likes } from "../../../entity/likes.js";
import { checkProps, checkUUID } from "../../../validation.js";

export default Router().delete("/api/likes/:id", async (req, res, next) => {
  try {
    const { id } = checkRequest(req.params);
    await likes.drop(process.env.USER_ID!, id);
    res.status(204);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  id: string;
};
function checkRequest(payload: { [k: string]: unknown }): Payload {
  checkProps("/", payload, ["id"]);
  checkUUID("/id", payload.id);
  return payload as Payload;
}
