require("dotenv").config();
const Db = require("../src/db/db.js");
const Telegram = require("../src/telegram");

(async () => {
  const db = await new Db();

  const telegramBot = new Telegram(db);

  const todo = {
    id: 999,
    username: "test",
    body: "test",
    images: [],
    videos: [],
  };

  await telegramBot.sendMessage(418995974, todo);

  process.exit();
})();
