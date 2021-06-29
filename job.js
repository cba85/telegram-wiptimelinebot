require("dotenv").config();
const { browse } = require("./src/parser.js");
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

(async () => {
  const db = new Db();
  db.connect();
  const follows = await db.getMakers();

  const todos = await browse(follows);
  const telegramBot = new Telegram();

  console.log(todos);

  for (key in todos) {
    const todo = todos[key];
    const exists = await db.existsTodo(todo.id);
    if (!exists) {
      await db.saveTodo(todo);
      telegramBot.sendMessage(todo);
    }
  }

  // Kill scripts after some times to give telegram API time to send messages
  setTimeout(function () {
    console.log("done");
    process.exit();
  }, 5000);
})();
