import { Connection } from "postgresql-client";

const connection = new Connection(
  "postgres://postgres:postgres@localhost/sticky",
);
await connection.connect();
const result = await connection.query("select * from collections where id = 1");
const rows: any[] = result.rows!;
console.log(rows);
await connection.close();
