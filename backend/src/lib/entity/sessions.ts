import { exec, selectOne, timestamp } from "./db.js";
import crypto from "crypto";

class Sessions {
  private static _schema = `
    CREATE TABLE sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      expiry TIMESTAMP NOT NULL
    )   
    `;

  /**
   * Create a new session, returning the session id.
   *
   * A user can have multiple concurrent sessions for different devices. The
   * time-to-live (ttl) value should be expressed in milliseconds.
   */
  async insert(userId: string, ttl: number): Promise<string> {
    const id = crypto.randomUUID();
    await exec(
      `
      INSERT INTO sessions (id, user_id, expiry) 
      VALUES ($1, $2, $3)
      `,
      [id, userId, timestamp(Date.now() + ttl)],
    );
    return id;
  }

  /**
   * Return an active session.
   *
   * Returns null if the session id isn't found or the session has expired.
   */
  async select(id: string): Promise<Session | null> {
    return await selectOne<Session>(
      `
      SELECT user_id
      FROM sessions
      WHERE id = $1 AND now() <= expiry
      `,
      [id],
    );
  }

  /**
   * Delete a session.
   */
  async drop(id: string): Promise<void> {
    await exec(
      `
      DELETE FROM sessions
      WHERE id = $1
      `,
      [id],
    );
  }
}

export type Session = { userId: string };
export const sessions = new Sessions();
