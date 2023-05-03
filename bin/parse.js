require("dotenv").config();

const { browse } = require("../src/parser");
const Telegram = require("../src/telegram");
const Db = require("../src/db/db");

(async () => {
  console.log(`🤖 Start WIP.co parser`);
  const db = await new Db();

  const telegramBot = new Telegram(db);

  // Get users
  const users = await db.getUsers();

  for (user of users) {
    console.log(`👋 User: ${user.username} #${user.id}`);

    // Get the followers of the current user
    const follows = await db.getFollowers(user.id);
    //console.log(follows);

    let maxPage = 1;
    if (typeof process.argv[2] !== "undefined") {
      maxPage = parseInt(process.argv[2]);
    }

    // Get todos from the makers followed by the current user
    const todos = await browse(follows, maxPage);

    // Debug todos
    //console.log(todos);
    //return;

    console.log(`👀 ${todos.length} todos retrieved for this user`);

    let countTodosSent = 0;
    for (todo of todos) {
      const exists = await db.existsTodo(user.id, todo.id);
      //const exists = false;

      // Save todo and send it to Telegram if new
      if (!exists) {
        await db.saveTodo(user.id, todo);
        telegramBot.sendMessage(user.id, todo);
        countTodosSent++;
        console.log(`💬 ${countTodosSent} | ${todo.username}: ${todo.body}`);
        console.log(
          `${todo.images.length} photos + ${todo.videos.length} videos`
        );
      }
    }

    console.log(`💬 ${countTodosSent} todos sent to Telegram`);
  }

  // Kill scripts after some times to give telegram API time to send messages
  setTimeout(function () {
    process.exit();
  }, 10000);
})();
