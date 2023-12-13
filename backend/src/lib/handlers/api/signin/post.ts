import { Router } from "express";
import { newSession } from "../../../auth.js";
import { checkProps, checkString } from "../../../validation.js";
import { NAME_MAXLEN } from "../../../entity/users.js";

export default Router().post("/api/signin", async (req, res, next) => {
  try {
    const { name } = checkRequest(req.body);
    await newSession(res, name);
    res.end();
  } catch (e) {
    next(e);
  }
});

type Payload = {
  name: string;
};
function checkRequest(payload: { [k: string]: unknown }): Payload {
  checkProps("/", payload, ["name"]);
  checkString("/name", payload.name, {
    minLength: 2,
    maxLength: NAME_MAXLEN,
  });
  return payload as Payload;
}
