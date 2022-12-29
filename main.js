require("dotenv").config();
const Telegram = require("./src/telegram");
const Db = require("./src/db/db");

(async () => {
  const db = await new Db();

  const telegramBot = new Telegram("polling", db);
  telegramBot.listen();
})();
