const telegramBot = require("node-telegram-bot-api");

module.exports = class Telegram {
  constructor() {
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
  }

  listen() {
    this.bot.onText(/\/help/, function (msg) {
      console.log(msg);
      var fromId = msg.from.id;
      bot.sendMessage(fromId, msg.from.first_name + " " + msg.from.last_name);
    });
  }

  sendMessage({ body, username, attachments }) {
    if (!attachments.length) {
      const message = `${username}: ${body}`;

      try {
        this.bot.sendMessage(this.chatId, message, {
          parse_mode: "html",
          disable_web_page_preview: true,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      const noLinksBody = body.replace(/<a\b[^>]*>(.*?)<\/a>/g, "");
      const caption = `${username}: ${noLinksBody}`;

      for (let attachment of attachments) {
        try {
          this.bot.sendPhoto(this.chatId, attachment, { caption: caption });
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};
