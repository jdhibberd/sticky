/**
 * Helper functions for interacting with the database.
 *
 * Each underlying database table should have a corresponding entity module that
 * is the exclusive way through which the application accesses the data in that
 * table.
 *
 * Each method should correspond to a single logical INSERT, UPDATE, DELETE, or
 * SELECT operation. Sometimes a single logical operation will consist of
 * multiple individual SQL statements being executed, in which case they should
 * all be executed within the same method, and ideally concurrently
 * using `Promise.all`.
 *
 * An ORM could be used to abstract away the SQL statements but this often
 * results in SQL statements being automatically generated that don't do quite
 * what you want, or do it not very efficiently, or -- worse -- do it wrong.
 * SQL is a simple language and engineers should be comfortable crafting queries
 * that do exactly what their application needs.
 *
 * Although it's possible for each SQL statement to be highly templatised (to
 * automatically generate the table name, column names, etc) this makes the SQL
 * statements much harder to read and the tradeoff isn't worth it. Changing a
 * table or column name can be done easily enough using find/replace within the
 * single module that represents the table being modified.
 */

import Pool from "pg-pool";

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

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function exec(
  sql: string,
  params: (string | number)[],
): Promise<void> {
  await pool.query(sql, params);
}

/**
 * Execute a SELECT query and hydrate the result rows into JavaScript objects
 * using the fields names returned by the result object to determine the object
 * property names. Also converts "snake case" database field names to
 * "camel case" JavaScript object property names.
 *
 * [[1, 2, 3], [4, 5, 6]]
 * ->
 * [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}]
 */
export async function select<T>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  const result = await pool.query({
    rowMode: "array",
    text: sql,
    values: params,
  });
  const camelCaseFields = getCamelCaseFields(result.fields);
  return result.rows.map(
    (row: unknown[]) =>
      Object.fromEntries(
        row.map((value, i) => [camelCaseFields[i], value]),
      ) as T,
  );
}

/**
 * Execute a SELECT query and hydrate the single result row into a JavaScript
 * object using the fields names returned by the result object to determine the
 * object property names. Also converts "snake case" database field names to
 * "camel case" JavaScript object property names.
 *
 * [[1, 2, 3]]
 * ->
 * {a: 1, b: 2, c: 3}
 */
export async function selectOne<T>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T | null> {
  const result = await pool.query({
    rowMode: "array",
    text: sql,
    values: params,
  });
  if (result.rows.length === 0) {
    return null;
  }
  const camelCaseFields = getCamelCaseFields(result.fields);
  return Object.fromEntries(
    result.rows[0].map((value: unknown, i: number) => [
      camelCaseFields[i],
      value,
    ]),
  ) as T;
}

/**
 * Convert snake case database field names to camel case JavaScript object
 * property names. The field names are included in the database query response
 * object.
 *
 * [{name: a_b}, {name: d_e}]
 * ->
 * ["aB", "dE"]
 */
function getCamelCaseFields(fields: { name: string }[]): string[] {
  return fields.map((field) =>
    field.name.replace(/(_\w)/g, (k) => k[1].toUpperCase()),
  );
}

/**
 * Execute a SELECT query and return a flattened array of values.
 *
 * [[1], [2], [3]]
 * ->
 * [1, 2, 3]
 */
export async function selectArray<T>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  const result = await pool.query({
    rowMode: "array",
    text: sql,
    values: params,
  });
  return result.rows.length > 0
    ? result.rows.map((row: unknown[]) => row[0] as T)
    : [];
}

export async function closeDbConnections() {
  await pool.end();
}
