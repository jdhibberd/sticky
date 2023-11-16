import { exec, selectOne } from "./db.js";
import crypto from "crypto";

// @frontend-export SESSION
export const NAME_MAXLEN = 32;

class Sessions {
  private static _schema = `
    CREATE TABLE sessions (
      id UUID PRIMARY KEY,
      name VARCHAR(${NAME_MAXLEN}) NOT NULL
    )   
    `;

  /**
   * Create a new user session, returning the session id.
   */
  async insert(name: string): Promise<string> {
    const id = crypto.randomUUID();
    await exec(
      `
      INSERT INTO sessions (id, name) 
      VALUES ($1, $2)
      `,
      [id, name],
    );
    return id;
  }

  /**
   * Return a user session object, or null if the session id is invalid.
   */
  async select(id: string): Promise<Session | null> {
    return await selectOne<Session>(
      `
      SELECT name
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

export type Session = { name: string };
export const sessions = new Sessions();
