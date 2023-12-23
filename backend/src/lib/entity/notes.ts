import { exec, select, selectOne, ParamBuilder } from "./db.js";
import crypto from "crypto";
import { NotePath } from "../util.js";

// @frontend-export NOTE
export const CONTENT_MAXLEN = 128;
// @frontend-export NOTE
export const PATH_MAXDEPTH = 5;

// maximum path length is determined by the length of a uuid string (36 bytes)
// multiplied by the max path depth, also allowing for a delimiter char between
// uuids
export const PATH_MAXLEN = 36 * PATH_MAXDEPTH + (PATH_MAXDEPTH - 1); // 184

class Notes {
  private static _schema = `
    CREATE TABLE notes (
      id UUID PRIMARY KEY,
      content VARCHAR(${CONTENT_MAXLEN}) NOT NULL,
      path VARCHAR(${PATH_MAXLEN}) NOT NULL,
      author_id UUID NOT NULL,
      modified TIMESTAMP NOT NULL
    )
    `;

  /**
   * Insert a new note.
   */
  async insert(path: string, content: string, authorId: string): Promise<void> {
    await exec(
      `
      INSERT INTO notes (id, content, path, author_id, modified) 
      VALUES ($1, $2, $3, $4, 'now')
      `,
      [crypto.randomUUID(), content, path, authorId],
    );
  }

  /**
   * Update an existing note.
   */
  async update(id: string, content: string): Promise<void> {
    await exec(
      `
      UPDATE notes
      SET content = $2, modified = 'now'
      WHERE id = $1
      `,
      [id, content],
    );
  }

  /**
   * Retrieve all note entities in a single query that are necessary to render
   * a note view on the client.
   */
  async selectByPath(path: string): Promise<Note[]> {
    if (path === "") {
      return await select<Note>(
        `
        SELECT id, content, path, author_id, modified
        FROM notes
        WHERE path = ''
        `,
      );
    }
    const ancestorIds = NotePath.split(path);
    const param = new ParamBuilder();
    return await select(
      `
      SELECT id, content, path, author_id, modified
      FROM notes
      WHERE id IN (${param.insert(ancestorIds.length)})
      UNION
      SELECT id, content, path, author_id, modified
      FROM notes
      WHERE path = ${param.insert()}
      `,
      [...ancestorIds, path],
    );
  }

  /**
   * Read a single note by its id.
   */
  async selectById(id: string): Promise<Note | null> {
    return await selectOne<Note>(
      `
      SELECT id, content, path, author_id, modified
      FROM notes
      WHERE id = $1
      `,
      [id],
    );
  }

  /**
   * Drop a note entity and all its descendant children note entities.
   */
  async dropRecursively(note: Note): Promise<void> {
    const path = `${note.path}${note.path ? "/" : ""}${note.id}`;
    await Promise.all([
      exec(
        `
        DELETE FROM notes
        WHERE id = $1
        `,
        [note.id],
      ),
      exec(
        `
        DELETE FROM notes
        WHERE path LIKE $1
        `,
        [`${path}%`],
      ),
    ]);
  }
}

export type Note = {
  id: string;
  content: string;
  path: string;
  authorId: string;
  modified: number;
};
export const notes = new Notes();
