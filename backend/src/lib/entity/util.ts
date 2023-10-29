// QUIRK: the module `postgresql-client` doesn't have types correctly configured
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Connection } from "postgresql-client";

/**
 * Insert parameter placeholders into SQL statements, keeping track of the
 * positional number.
 *
 * XXX insert(3) YYY insert() ZZZ insert(2)
 * ->
 * XXX $1, $2, $3 YYY $4 ZZZ $5, $6
 */
export class ParamBuilder {
  constructor(private index: number = 0) {}
  insert(count: number = 1): string {
    const result = [];
    for (let i = 0; i < count; i++, this.index++) {
      result.push(`$${this.index + 1}`);
    }
    return result.join(", ");
  }
}

/**
 * Wrapper around a database connection for executing queries.
 */
export class Query {
  conn: Connection;

  constructor() {
    this.conn = new Connection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  async start(): Promise<void> {
    await this.conn.connect();
  }

  async exec(sql: string, params: (string | number)[]): Promise<void> {
    await this.conn.query(sql, { params });
  }

  /**
   * Execute a SELECT query and hydrate the result rows into JavaScript objects
   * using the fields names returned by the result object to determine the
   * object property names. Also converts "snake case" database field names to
   * "camel case" JavaScript object property names.
   *
   * [[1, 2, 3], [4, 5, 6]]
   * ->
   * [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}]
   */
  async select<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
    const result = await this.conn.query(sql, { params });
    const rows = result.rows === undefined ? [] : result.rows;
    const camelCaseFields = result.fields.map((field: { fieldName: string }) =>
      field.fieldName.replace(/(_\w)/g, (k) => k[1].toUpperCase()),
    );
    return rows.map((row: unknown[]) =>
      Object.fromEntries(row.map((value, i) => [camelCaseFields[i], value])),
    );
  }

  async end(): Promise<void> {
    await this.conn.close();
  }
}
