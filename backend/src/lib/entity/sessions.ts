import { Query } from "./util.js";
import crypto from "crypto";

export type Session = { name: string };

class Sessions {
  private static _schema = `
    CREATE TABLE sessions (
      id UUID PRIMARY KEY,
      name VARCHAR(32) NOT NULL
    )   
    `;

  /**
   * Create a new user session, returning the session id.
   */
  async insert(name: string): Promise<string> {
    const id = crypto.randomUUID();
    const query = new Query();
    await query.start();
    try {
      await query.exec(
        `
        INSERT INTO sessions (id, name) 
        VALUES ($1, $2)
        `,
        [id, name],
      );
      return id;
    } finally {
      await query.end();
    }
  }

  /**
   * Return a user session object, or null if the session id is invalid.
   */
  async select(id: string): Promise<Session | null> {
    const query = new Query();
    await query.start();
    try {
      return await query.selectOne<Session>(
        `
        SELECT name
        FROM sessions
        WHERE id = $1
        `,
        [id],
      );
    } finally {
      await query.end();
    }
  }

  /**
   * Delete a user session.
   */
  async drop(id: string): Promise<void> {
    const query = new Query();
    await query.start();
    try {
      await query.exec(
        `
        DELETE FROM sessions
        WHERE id = $1
        `,
        [id],
      );
    } finally {
      await query.end();
    }
  }
}

export const sessions = new Sessions();
