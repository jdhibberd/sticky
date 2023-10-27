// QUIRK: the module `postgresql-client` doesn't have types correctly configured
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Connection } from "postgresql-client";
import crypto from "crypto";
import { getAncestorIdsFromNotePath } from "./note-view-data.js";

/**
 * Provides simple read/write access to entities stored in the database.
 */
class Entities<T extends { [key: string]: unknown; id?: string }> {
  // helper strings to make it more convenient to build sql statements
  protected propsList: string;
  private insertParams: string;
  private updateParams: string;

  constructor(
    protected table: string,
    private props: Extract<Exclude<keyof T, "id">, string>[],
    protected connConfig: { [k: string]: string | undefined },
  ) {
    const propsSnakeCase = props.map((str) =>
      str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    );
    this.propsList = propsSnakeCase.join(", ");
    this.insertParams = props.map((_, i) => `$${i + 2}`).join(", ");
    this.updateParams = propsSnakeCase
      .map((x, i) => `${String(x)} = $${i + 2}`)
      .join(", ");
  }

  /**
   * Insert a new entity into the database, or update an existing entity in the
   * database. If the entity contains an `id` property then an update will be
   * performed, otherwise an `id` property will be added to the entity with a
   * new generated id and insert will be performed.
   */
  async upsert(entity: T): Promise<void> {
    const values = this.props.map((prop) => entity[prop]);
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      if ("id" in entity) {
        await conn.query(
          `
          UPDATE ${this.table} 
          SET ${this.updateParams} 
          WHERE id = $1
          `,
          { params: [entity.id, ...values] },
        );
      } else {
        await conn.query(
          `
          INSERT INTO ${this.table}(id, ${this.propsList}) 
          VALUES(uuid($1), ${this.insertParams})
          `,
          { params: [crypto.randomUUID(), ...values] },
        );
      }
    } finally {
      await conn.close();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async selectAll(): Promise<T[]> {
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      const result = await conn.query(
        `
        SELECT id, ${this.propsList} 
        FROM ${this.table}
        `,
      );
      if (result.rows === undefined) throw "No rows returned.";
      return result.rows.map(this.hydrateEntity.bind(this));
    } finally {
      await conn.close();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async selectById(id: string): Promise<T | null> {
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      const result = await conn.query(
        `
        SELECT id, ${this.propsList} 
        FROM ${this.table} 
        WHERE id = $1
        `,
        { params: [id] },
      );
      if (result.rows === undefined) throw "No rows returned.";
      if (result.rows.length === 0) return null;
      return this.hydrateEntity(result.rows[0]);
    } finally {
      await conn.close();
    }
  }

  /**
   * Delete an entity from the database.
   */
  async drop(id: string): Promise<void> {
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      await conn.query(
        `
        DELETE FROM ${this.table} 
        WHERE id = $1
        `,
        { params: [id] },
      );
    } finally {
      await conn.close();
    }
  }

  /**
   * Convert an array of entity property values that have been returned from the
   * database into a JavaScript object with property names and values.
   *
   * [1, 2, 3] -> {a: 1, b: 2, c: 3}
   */
  protected hydrateEntity(row: unknown[]): T {
    return Object.fromEntries(
      row.map<[keyof T, unknown]>((value, i) => [
        i === 0 ? "id" : this.props[i - 1],
        value,
      ]),
    ) as T;
  }
}

class Notes extends Entities<Note> {
  /**
   * Retrieve all note entities in a single query that are necessary to render
   * a note view on the client.
   */
  async selectByPath(path: string): Promise<Note[]> {
    if (path === "") return this.selectAll();
    const ancestorIds = getAncestorIdsFromNotePath(path);
    const ancestorPlaceholders = ancestorIds
      .map((_, i) => `$${i + 1}`)
      .join(", ");
    const likePlaceholder = `$${ancestorIds.length + 1}`;
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      const result = await conn.query(
        `
        SELECT id, ${this.propsList}
        FROM ${this.table}
        WHERE id IN (${ancestorPlaceholders})
        UNION
        SELECT id, ${this.propsList}
        FROM ${this.table}
        WHERE path LIKE ${likePlaceholder}
        `,
        { params: [...ancestorIds, `${path}%`] },
      );
      if (result.rows === undefined) throw "No rows returned.";
      return result.rows.map(this.hydrateEntity.bind(this));
    } finally {
      await conn.close();
    }
  }

  /**
   * Drop a note entity and all its descendant children note entities.
   */
  async dropRecursively(note: Note): Promise<void> {
    const path = `${note.path}${note.path ? "/" : ""}${note.id}`;
    const conn = new Connection(this.connConfig);
    await conn.connect();
    try {
      await conn.query(
        `
        DELETE FROM ${this.table} 
        WHERE id = $1
        `,
        { params: [note.id] },
      );
      await conn.query(
        `
        DELETE FROM ${this.table} 
        WHERE path LIKE $1
        `,
        { params: [`${path}%`] },
      );
    } finally {
      await conn.close();
    }
  }
}

/**
 * Schema
 */
const connConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
export type Note = { id: string; content: string; likes: number; path: string };
export const notes = new Notes(
  "notes",
  ["content", "likes", "path"],
  connConfig,
);
export type Like = { id: string; noteId: string; userId: number };
export const likes = new Likes("likes", ["noteId", "userId"], connConfig);
export type User = { id: string; name: string };
export const users = new Entities<User>("users", ["name"], connConfig);
