const telegramBot = require("node-telegram-bot-api");

module.exports = class Telegram {
  constructor() {
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }

  /*
  listen() {
    this.bot.onText(/\/help/, function (msg) {
      console.log(msg);
      var fromId = msg.from.id;
      bot.sendMessage(fromId, msg.from.first_name + " " + msg.from.last_name);
    });
  }
  */

  sendMessage({ body, username, images, videos }) {
    const message = `${username}: ${body}`;

    if (!images.length && !videos.length) {
      try {
        this.bot.sendMessage(this.chatId, message, {
          parse_mode: "html",
          disable_web_page_preview: true,
        });
      } catch (error) {
        console.log(error);
      }
      return;
    }

    if (images.length) {
      for (let image of images) {
        try {
          this.bot.sendPhoto(this.chatId, image, {
            caption: message,
            parse_mode: "html",
          });
        } catch (error) {
          console.log(error);
        }
      }
      return;
    }

    if (videos.length) {
      for (let video of videos) {
        try {
          this.bot.sendVideo(this.chatId, video, {
            caption: message,
            parse_mode: "html",
          });
        } catch (error) {
          console.log(error);
        }
      }
      return;
    }
  }
};
