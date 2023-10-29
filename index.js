require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const Telegram = require("./src/telegram");
const Db = require("./src/db/db");
const nunjucks = require("nunjucks");

(async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(compression());
  app.use(helmet());

  let noCache = false;
  if (process.env.APP_ENV == "local") {
    noCache = true;
  }

  let env = nunjucks.configure("views", {
    autoescape: true,
    express: app,
    noCache: noCache,
  });

  app.use(express.static("public"));

  const db = await new Db();

  const telegramBot = new Telegram(db);
  telegramBot.listen();

  const server = app.listen(process.env.PORT, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Web server started at http://%s:%s", host, port);
  });

  app.get("/", async (req, res) => {
    res.render("index.html");
  });

  app.post(`/${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    telegramBot.bot.processUpdate(req.body);
    res.sendStatus(200);
  });
})();
