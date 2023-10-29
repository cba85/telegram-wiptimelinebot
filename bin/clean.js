require("dotenv").config({ path: __dirname + "/../.env" });

const Db = require("../src/db/db");

(async () => {
  const db = await new Db();

  console.log("🧹 Clean todos older than a week job done");
  const removedTodosCount = await db.cleanTodos();
  console.log(`${removedTodosCount} todo(s) deleted.`);

  process.exit();
})();
