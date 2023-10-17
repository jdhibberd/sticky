import { Connection } from "postgresql-client";

const connection = new Connection(
  "postgres://postgres:postgres@localhost/sticky",
);

export async function getTestDbValue(): Promise<[number, string]> {
  await connection.connect();
  const result = await connection.query(
    "select * from collections where id = 1",
  );
  const rows: any[] = result.rows!;
  await connection.close();
  return rows[0];
}
