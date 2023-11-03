import { Query, ParamBuilder } from "./util.js";
import { getAncestorIdsFromNotePath } from "../model/note-page.js";
import crypto from "crypto";

class Notes {
  private static _schema = `
    CREATE TABLE notes (
      id UUID PRIMARY KEY,
      author_id UUID NOT NULL,
      content TEXT NOT NULL,
      path TEXT NOT NULL
    )
    `;

  /**
   * Insert a new entity into the database, or update an existing entity in the
   * database. If the entity contains an `id` property then an update will be
   * performed, otherwise an `id` property will be added to the entity with a
   * new generated id and insert will be performed.
   */
  async upsert(note: Note): Promise<void> {
    const query = new Query();
    await query.start();
    try {
      const values = [note.content, note.path];
      if ("id" in note) {
        await query.exec(
          `
          UPDATE notes
          SET content = $2, path = $3
          WHERE id = $1
          `,
          [note.id, ...values],
        );
      } else {
        await query.exec(
          `
          INSERT INTO notes (id, content, path) 
          VALUES ($1, $2, $3)
          `,
          [crypto.randomUUID(), ...values],
        );
      }
    } finally {
      await query.end();
    }
  }

  /**
   * Retrieve all note entities in a single query that are necessary to render
   * a note view on the client.
   */
  async selectByPath(path: string): Promise<Note[]> {
    if (path === "") return this.selectAll();
    const query = new Query();
    await query.start();
    try {
      const ancestorIds = getAncestorIdsFromNotePath(path);
      const param = new ParamBuilder();
      return await query.select(
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
    } finally {
      await query.end();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async selectAll(): Promise<Note[]> {
    const query = new Query();
    await query.start();
    try {
      return await query.select<Note>(
        `
        SELECT id, content, path
        FROM notes
        `,
      );
    } finally {
      await query.end();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async selectById(id: string): Promise<Note | null> {
    const query = new Query();
    await query.start();
    try {
      const result = await query.select<Note>(
        `
        SELECT id, content, path
        FROM notes
        WHERE id = $1
        `,
        [id],
      );
      return result.length === 0 ? null : result[0];
    } finally {
      await query.end();
    }
  }

  /**
   * Drop a note entity and all its descendant children note entities.
   */
  async dropRecursively(note: Note): Promise<void> {
    const query = new Query();
    await query.start();
    try {
      const path = `${note.path}${note.path ? "/" : ""}${note.id}`;
      await Promise.all([
        query.exec(
          `
          DELETE FROM notes
          WHERE id = $1
          `,
          [note.id],
        ),
        query.exec(
          `
          DELETE FROM notes
          WHERE path LIKE $1
          `,
          [`${path}%`],
        ),
      ]);
    } finally {
      await query.end();
    }
  }
}

export type Note = { id: string; content: string; path: string };
export const notes = new Notes();
