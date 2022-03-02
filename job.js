require("dotenv").config();
const { browse } = require("./src/parser.js");
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

(async () => {
  const db = new Db();
  db.connect();

  const telegramBot = new Telegram();
  const users = await db.getUsers();

  for (user of users) {
    const follows = await db.getFollowers(user);

    let maxPage = 1;
    if (typeof process.argv[2] !== "undefined") {
      maxPage = parseInt(process.argv[2]);
    }

    const todos = await browse(follows, maxPage);

    for (key in todos) {
      const todo = todos[key];
      const exists = await db.existsTodo(user, todo.id);
      if (!exists) {
        await db.saveTodo(user, todo);
        telegramBot.sendMessage(user, todo);
      }
    }
  }

  // Kill scripts after some times to give telegram API time to send messages
  setTimeout(function () {
    console.log("done");
    process.exit();
  }, 5000);
})();
