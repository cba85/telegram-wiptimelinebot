require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Telegram = require("./src/telegram");
const Db = require("./src/db/db");

(async () => {
  const db = await new Db();

  if (process.env.APP_ENV == "local") {
    telegramBot = new Telegram("polling", db);
  } else {
    telegramBot = new Telegram("webhook", db);
  }

  telegramBot.listen();

  const app = express();
  app.use(bodyParser.json());

  var server = app.listen(process.env.PORT, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Web server started at http://%s:%s", host, port);
  });

  app.get("/", (req, res) => {
    res.send("Telegram WIP.co timeline bot");
  });

  app.post("/" + telegramBot.bot.token, (req, res) => {
    telegramBot.bot.processUpdate(req.body);
    res.sendStatus(200);
  });
})();
