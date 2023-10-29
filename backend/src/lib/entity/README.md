- **Method Structure**: All methods should follow the following template:
  ```javascript
  async f(...): Promise<...> {
    const query = new Query();
    await query.start();
    try {
      return await query.(
        `
        SQL_STATEMENT
        `,
        args
      );
    } finally {
      await query.end();
    }
  }
  ```
- **Encapsulation**: Each underlying database table should have a corresponding entity module that is the exclusive way through which the application accesses the data in that table. Each method should correspond to a single logical `INSERT`, `UPDATE`, `DELETE`, or `SELECT` operation. Sometimes a single logical operation will consist of multiple individual SQL statements being executed, in which case they should all be executed within the same method, and ideally concurrently using `Promise.all`
- **ORMs**: An ORM could be used to abstract away the SQL statements but this often results in SQL statements being automatically generated that don't do quite what you want, or do it not very efficiently, or -- worse -- do it wrong. SQL is a simple language and engineers should be comfortable crafting queries that do exactly what their application needs.
- **SQL Templating**: Although it's possible for each SQL statement to be highly templatised (to automatically generate the table name, column names, etc) this makes the SQL statements much harder to read and the tradeoff isn't worth it. Changing a table or column name can be done easily enough using find/replace within the single module that represents the table being modified.
