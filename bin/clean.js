require("dotenv").config({ path: __dirname + "/../.env" });

const Db = require("../src/db/db");

(async () => {
  const db = await new Db();

  const removedTodosCount = await db.cleanTodos();

  console.log(
    `${new Date().toISOString()} [CLEAN OLD TODOS] ${removedTodosCount} todo(s) deleted`
  );

  process.exit();
})();
