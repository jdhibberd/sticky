import { NextFunction, Request, Response } from "express";
import type { Session } from "./entity/sessions.js";
import { sessions } from "./entity/sessions.js";

// make the user's session available on the express request object for
// convenience
declare module "express-serve-static-core" {
  interface Request {
    session: Session;
  }
}

/**
 * Express handler for enforcing that the user has a valid session. If they have
 * then the session is added to the Express request object for the convenience
 * of subsequent handlers. If they don't then an error is returned and there is
 * no further handling of the request.
 */
export async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getSession(req);
    if (session === null) {
      res.status(401);
      res.end();
      return;
    }
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Get the current user session, or null if none exists.
 */
export async function getSession(req: Request): Promise<Session | null> {
  const sessionId = req.signedCookies.sessionId;
  // a value of undefined indicates that the user doesn't have a session cookie
  // and a value of false indicates that the signed session cookie has been
  // tampered with
  if (sessionId === undefined || sessionId === false) {
    return null;
  }
  return await sessions.select(sessionId);
}

/**
 * Create a new user session.
 */
export async function newSession(res: Response, name: string): Promise<void> {
  const sessionId = await sessions.insert(name);
  res.cookie("sessionId", sessionId, { signed: true });
}
