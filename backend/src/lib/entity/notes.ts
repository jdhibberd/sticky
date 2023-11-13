import { exec, select, selectOne, ParamBuilder } from "./db.js";
import { getAncestorIdsFromNotePath } from "../model/note-page.js";
import { addCustomValidation } from "../validation.js";
import crypto from "crypto";

export const CONTENT_MAXLEN = 128;
export const PATH_MAXLEN = 1024;
export const PATH_MAXDEPTH = 5;

class Notes {
  private static _schema = `
    CREATE TABLE notes (
      id UUID PRIMARY KEY,
      content VARCHAR(${CONTENT_MAXLEN}) NOT NULL,
      path VARCHAR(${PATH_MAXLEN}) NOT NULL
    )
    `;

  /**
   * Insert a new entity into the database, or update an existing entity in the
   * database. If the entity contains an `id` property then an update will be
   * performed, otherwise an `id` property will be added to the entity with a
   * new generated id and insert will be performed.
   */
  async upsert({
    content,
    path,
    id,
  }: {
    content: string;
    path: string;
    id?: string;
  }): Promise<void> {
    if (id === undefined) {
      await exec(
        `
        INSERT INTO notes (id, content, path) 
        VALUES ($1, $2, $3)
        `,
        [crypto.randomUUID(), content, path],
      );
    } else {
      await exec(
        `
        UPDATE notes
        SET content = $2, path = $3
        WHERE id = $1
        `,
        [id, content, path],
      );
    }
  }

  /**
   * Retrieve all note entities in a single query that are necessary to render
   * a note view on the client.
   */
  async selectByPath(path: string): Promise<Note[]> {
    if (path === "") return this.selectAll();
    const ancestorIds = getAncestorIdsFromNotePath(path);
    const param = new ParamBuilder();
    return await select(
      `
      SELECT id, content, path
      FROM notes
      WHERE id IN (${param.insert(ancestorIds.length)})
      UNION
      SELECT id, content, path
      FROM notes
      WHERE path LIKE ${param.insert()}
      `,
      [...ancestorIds, `${path}%`],
    );
  }

  /**
   * Read all notes.
   */
  async selectAll(): Promise<Note[]> {
    return await select<Note>(
      `
      SELECT id, content, path
      FROM notes
      `,
    );
  }

  /**
   * Read a single note by its id.
   */
  async selectById(id: string): Promise<Note | null> {
    return await selectOne<Note>(
      `
      SELECT id, content, path
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

export type Note = { id: string; content: string; path: string };
export const notes = new Notes();

/**
 * A custom validator to check the depth of the path field.
 */
addCustomValidation({
  keyword: "maxPathDepth",
  type: "string",
  validate: (schema: number, data: string) => data.split("/").length < schema,
});
