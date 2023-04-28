require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Telegram = require("./src/telegram");
const Db = require("./src/db/db");

(async () => {
  const app = express();
  app.use(bodyParser.json());

  const db = await new Db();

  const telegramBot = new Telegram(db);
  telegramBot.listen();

  const server = app.listen(process.env.PORT, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Web server started at http://%s:%s", host, port);
  });

  app.get("/", async (req, res) => {
    res.send("Telegram WIP.co timeline bot");
  });

  app.post(`/${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    telegramBot.bot.processUpdate(req.body);
    res.sendStatus(200);
  });
})();
