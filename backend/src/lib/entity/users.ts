import { selectOne } from "./db.js";

export const EMAIL_MINLEN = 5;
// @frontend-export USER
export const EMAIL_MAXLEN = 255;

class Users {
  private static _schema = `
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      email VARCHAR(${EMAIL_MAXLEN}) UNIQUE NOT NULL
    )   
    `;

  /**
   * Return whether an email address already exists in the table.
   */
  async existsEmail(email: string): Promise<boolean> {
    const result = await selectOne<{ id: string }>(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email],
    );
    return result !== null;
  }
}

export const users = new Users();
