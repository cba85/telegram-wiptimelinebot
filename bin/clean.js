require("dotenv").config();

const Db = require("../src/db/db");

(async () => {
  const db = await new Db();

  console.log("🧹 Clean todos older than a week job done");
  const removedTodosCount = await db.cleanTodos();
  console.log(`${removedTodosCount} todo(s) deleted.`);

  // Kill scripts after some times to give telegram API time to send messages
  setTimeout(function () {
    process.exit();
  }, 5000);
})();
