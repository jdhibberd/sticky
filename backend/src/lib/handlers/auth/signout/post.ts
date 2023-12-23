import { Router } from "express";
import { endSession } from "../../../auth.js";

export default Router().post("/auth/signout", async (req, res, next) => {
  try {
    await endSession(req, res);
    res.status(200);
    res.end();
  } catch (e) {
    next(e);
  }
});
