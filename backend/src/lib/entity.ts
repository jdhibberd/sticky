// @ts-ignore
import { Connection } from "postgresql-client";
import crypto from "crypto";

/**
 * Provides simple read/write access to entities stored in the database.
 */
class Entity<T extends { [key: string]: unknown; id?: string }> {
  private insertSql: string;
  private selectSql: string;
  private updateSql: string;
  private dropSql: string;

  constructor(
    table: string,
    private props: Exclude<keyof T, "id">[],
    private options: string,
  ) {
    const propsList = props.join(", ");
    const insertSqlValues = props.map((_x, i) => `\$${i + 2}`).join(", ");
    this.insertSql = `
      INSERT INTO ${table}(id, ${propsList}) 
      VALUES(uuid($1), ${insertSqlValues})`;
    this.selectSql = `SELECT id, ${propsList} FROM ${table}`;
    const updateSqlPairs = props
      .map((x, i) => `${String(x)} = \$${i + 2}`)
      .join(", ");
    this.updateSql = `UPDATE ${table} SET ${updateSqlPairs} WHERE id = $1`;
    this.dropSql = `DELETE FROM ${table} WHERE id = $1`;
  }

  /**
   * Insert a new entity into the database, or update an existing entity in the
   * database. If the entity contains an `id` property then an update will be
   * performed, otherwise an `id` property will be added to the entity with a
   * new generated id and insert will be performed.
   */
  async upsert(entity: T): Promise<void> {
    const values = this.props.map((prop) => entity[prop]);
    const conn = new Connection(this.options);
    await conn.connect();
    try {
      if (entity.hasOwnProperty("id")) {
        await conn.query(this.updateSql, {
          params: [entity.id, ...values],
        });
      } else {
        await conn.query(this.insertSql, {
          params: [crypto.randomUUID(), ...values],
        });
      }
    } finally {
      await conn.close();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async select(): Promise<T[]> {
    const conn = new Connection(this.options);
    await conn.connect();
    try {
      const result = await conn.query(this.selectSql);
      if (result.rows === undefined) throw "No rows returned.";
      return result.rows.map((row: unknown[]) => {
        return Object.fromEntries(
          row.map<[keyof T, unknown]>((value, i) => [
            i === 0 ? "id" : this.props[i - 1],
            value,
          ]),
        ) as T;
      });
    } finally {
      await conn.close();
    }
  }

  /**
   * Delete an entity from the database.
   */
  async drop(id: string): Promise<void> {
    const conn = new Connection(this.options);
    await conn.connect();
    try {
      await conn.query(this.dropSql, { params: [id] });
    } finally {
      await conn.close();
    }
  }
}

/**
 * Schema
 */
export type Collection = { id: string; name: string };
export type Note = { id: string; content: string };
const options = "postgres://postgres:postgres@localhost/sticky";
export const collections = new Entity<Collection>(
  "collections",
  ["name"],
  options,
);
export const notes = new Entity<Note>("notes", ["content"], options);
