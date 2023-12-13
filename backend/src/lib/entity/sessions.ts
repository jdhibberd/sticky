import { exec, selectOne } from "./db.js";
import crypto from "crypto";

class Sessions {
  private static _schema = `
    CREATE TABLE sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL
    )   
    `;

  /**
   * Create a new user session, returning the session id.
   */
  async insert(userId: string): Promise<string> {
    const id = crypto.randomUUID();
    await exec(
      `
      INSERT INTO sessions (id, user_id) 
      VALUES ($1, $2)
      `,
      [id, userId],
    );
    return id;
  }

  /**
   * Return a user session object, or null if the session id is invalid.
   */
  async select(id: string): Promise<Session | null> {
    return await selectOne<Session>(
      `
      SELECT user_id
      FROM sessions
      WHERE id = $1
      `,
      [id],
    );
  }

  /**
   * Delete a user session.
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
