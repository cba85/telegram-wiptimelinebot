require("dotenv").config({ path: __dirname + "/../.env" });

const { browse } = require("../src/parser");
const Telegram = require("../src/telegram");
const Db = require("../src/db/db");

(async () => {
  const db = await new Db();
  const telegramBot = new Telegram();

  // Get users
  const users = await db.getUsers();
  //console.log(users);

  for (user of users) {
    // Get the followers of the current user
    const follows = await db.getFollowers(user.id);
    //console.log(follows);

    let maxPage = 7;
    if (typeof process.argv[2] !== "undefined") {
      maxPage = parseInt(process.argv[2]);
    }

    // Get todos from the makers followed by the current user
    const todos = await browse(follows, maxPage);

    // Debug todos
    //console.log(todos);
    //process.exit();

    let countTodosSent = 0;
    for (todo of todos) {
      const exists = await db.existsTodo(user.id, todo.id);
      //const exists = false;

      // Save todo and send it to Telegram if new
      if (!exists) {
        await db.saveTodo(user.id, todo);
        await telegramBot.sendMessage(user.id, todo);
        countTodosSent++;

        //console.log(`💬 ${countTodosSent} | ${todo.username}: ${todo.body}`);
        /*
        console.log(
          `${todo.images.length} photos + ${todo.videos.length} videos`
        );
        */
      }
    }

    // Display logs only if send todo to Telegram
    if (countTodosSent) {
      console.log(`${new Date().toISOString()} [PARSE]`);
      console.log(`👋 User: ${user.username} #${user.id}`);
      console.log(`👀 ${todos.length} todos retrieved for this user`);
      console.log(`📢 ${countTodosSent} todos sent to Telegram`);
    }
  }

  process.exit();
})();
