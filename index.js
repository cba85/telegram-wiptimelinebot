require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Telegram = require("./src/telegram");
const Db = require("./src/db/db");

(async () => {
  const db = await new Db();

  const telegramBot = new Telegram("webhook", db);
  telegramBot.listen();

  const app = express();
  app.use(bodyParser.json());

  var server = app.listen(process.env.PORT, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Web server started at http://%s:%s", host, port);
  });

  app.get("/", (req, res) => {
    res.send("WIP.co Telegram timeline bot");
  });

  app.post("/" + telegramBot.bot.token, (req, res) => {
    telegramBot.bot.processUpdate(req.body);
    res.sendStatus(200);
  });
})();

/*
require("dotenv").config();

const { browse } = require("./src/parser.js");
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

const CronJob = require("cron").CronJob;
const job = new CronJob(
  "* * * * *",
  async () => {
    const db = new Db();

    const telegramBot = new Telegram(null, db);

    // Get users
    const users = await db.getUsers();

    for (user of users) {
      console.log(`User ${user.username} #${user.id}`);

      // Get the followers of the current user
      const follows = await db.getFollowers(user.id);

      let maxPage = 1;
      if (typeof process.argv[2] !== "undefined") {
        maxPage = parseInt(process.argv[2]);
      }

      // Get todos from the makers followed by the current user
      const todos = await browse(follows, maxPage);

      // Debug todos
      //console.log(todos);

      console.log(`${todos.length} todos retrieved`);

      let countTodosSent = 0;
      for (key in todos) {
        const todo = todos[key];
        const exists = await db.existsTodo(user.id, todo.id);

        // Save todo and send it to Telegram if new
        if (!exists) {
          await db.saveTodo(user.id, todo);
          telegramBot.sendMessage(user.id, todo);
          countTodosSent++;
        }
      }

      console.log(`${countTodosSent} todos sent`);
    }

    // Kill scripts after some times to give telegram API time to send messages
    setTimeout(function () {
      console.log("🤖 Parser job done");
      process.exit();
    }, 10000);
  },
  null,
  true,
  "Europe/Paris"
);

job.start();
*/
