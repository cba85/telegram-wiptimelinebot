require("dotenv").config();
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

const db = new Db();
db.connect();

const telegramBot = new Telegram("polling");
telegramBot.listen(db);
