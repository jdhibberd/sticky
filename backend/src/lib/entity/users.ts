import { exec, selectOne } from "./db.js";
import crypto from "crypto";

export const NAME_MINLEN = 2;
// @frontend-export USER
export const NAME_MAXLEN = 32;
export const EMAIL_MINLEN = 5;
// @frontend-export USER
export const EMAIL_MAXLEN = 255;

class Users {
  private static _schema = `
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      name VARCHAR(${NAME_MAXLEN}) NOT NULL,
      email VARCHAR(${EMAIL_MAXLEN}) UNIQUE NOT NULL
    )   
    `;

  /**
   * Create a new user, returning the user's id.
   */
  async insert(name: string, email: string): Promise<string> {
    const id = crypto.randomUUID();
    await exec(
      `
      INSERT INTO users (id, name, email) 
      VALUES ($1, $2, $3)
      `,
      [id, name, email],
    );
    return id;
  }

  /**
   * Select a user entity by its id.
   */
  async select(id: string): Promise<User | null> {
    return await selectOne<User>(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [id],
    );
  }

  /**
   * Select a user entity by its email.
   */
  async selectByEmail(email: string): Promise<User | null> {
    return await selectOne<User>(
      `
      SELECT id, name, email
      FROM users
      WHERE email = $1
      `,
      [email],
    );
  }
}

export type User = {
  id: string;
  name: string;
  email: string;
};
export const users = new Users();
