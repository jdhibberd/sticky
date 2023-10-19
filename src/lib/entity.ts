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
    private connection: Connection,
    table: string,
    private props: Exclude<keyof T, "id">[],
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
    await this.connection.connect();
    try {
      if (entity.hasOwnProperty("id")) {
        await this.connection.query(this.updateSql, {
          params: [entity.id, ...values],
        });
      } else {
        await this.connection.query(this.insertSql, {
          params: [crypto.randomUUID(), ...values],
        });
      }
    } finally {
      await this.connection.close();
    }
  }

  /**
   * Read all entities (of a common type) from the database.
   */
  async select(): Promise<T[]> {
    await this.connection.connect();
    try {
      const result = await this.connection.query(this.selectSql);
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
      await this.connection.close();
    }
  }

  /**
   * Delete an entity from the database.
   */
  async drop(id: string): Promise<void> {
    await this.connection.connect();
    try {
      await this.connection.query(this.dropSql, { params: [id] });
    } finally {
      await this.connection.close();
    }
  }
}

const connection = new Connection(
  "postgres://postgres:postgres@localhost/sticky",
);

/**
 * Schema
 */
type Collection = { id: string; name: string };
type Note = { id: string; content: string };
export const collections = new Entity<Collection>(connection, "collections", [
  "name",
]);
export const notes = new Entity<Note>(connection, "notes", ["content"]);
