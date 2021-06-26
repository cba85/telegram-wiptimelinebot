require("dotenv").config();
const { browse } = require("./src/parser.js");
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

(async () => {
  const db = new Db();
  db.connect();
  const looks = await db.getUsersToFollow();

  const todos = await browse(looks);
  const telegramBot = new Telegram();

  console.log(todos);

  for (key in todos) {
    const exists = await db.existsTodo(todos[key].id);
    if (!exists) {
      await db.saveTodo(todos[key]);
      telegramBot.sendMessage(todos[key]);
    }
  }

  //telegramBot.listen();
})();
