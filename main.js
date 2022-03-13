require("dotenv").config();
const Telegram = require("./src/telegram");
const Db = require("./src/db.js");

const db = new Db();

const telegramBot = new Telegram("polling", db);
telegramBot.listen();
