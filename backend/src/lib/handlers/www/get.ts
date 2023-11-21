import { Router } from "express";
import { getSession } from "../../auth.js";
import { trim, getPage } from "../../html.js";

export default Router().get("/", async (req, res, next) => {
  try {
    const session = await getSession(req);
    const bodyHTML = session === null ? getUnauthHTML() : getAppHTML();
    res.send(getPage(bodyHTML));
  } catch (e) {
    next(e);
  }
});

function getAppHTML(): string {
  return trim(`
    <div id="root"></div>
    <script defer src="app.js" type="module"></script>  
  `);
}

function getUnauthHTML(): string {
  return trim(`
    <div id="root"></div>
    <script defer src="unauth.js" type="module"></script>
  `);
}
