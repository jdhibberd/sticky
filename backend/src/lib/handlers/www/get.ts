import { Router } from "express";
import { getSession } from "../../auth.js";

export default Router().get("/", async (req, res, next) => {
  try {
    const session = await getSession(req);
    res.render(session === null ? "unauth" : "app");
  } catch (e) {
    next(e);
  }
});
