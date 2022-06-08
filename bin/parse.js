require("dotenv").config();

const { browse } = require("../src/parser.js");
const Telegram = require("../src/telegram");
const Db = require("../src/db.js");

(async () => {
  const db = new Db();

  const telegramBot = new Telegram(null, db);

  // Get users
  const users = await db.getUsers();

  for (user of users) {
    // Get the followers of the current user
    const follows = await db.getFollowers(user);

    let maxPage = 1;
    if (typeof process.argv[2] !== "undefined") {
      maxPage = parseInt(process.argv[2]);
    }

    // Get todos from the makers followed by the current user
    const todos = await browse(follows, maxPage);

    for (key in todos) {
      const todo = todos[key];
      const exists = await db.existsTodo(user, todo.id);

      // Save todo and send it to Telegram if new
      //if (!exists) {
      await db.saveTodo(user, todo);
      telegramBot.sendMessage(user, todo);
      //}
    }
  }

  // Kill scripts after some times to give telegram API time to send messages
  setTimeout(function () {
    console.log("🤖 Parser job done");
    process.exit();
  }, 10000);
})();
