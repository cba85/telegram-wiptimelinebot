const telegramBot = require("node-telegram-bot-api");

module.exports = class Telegram {
  constructor() {
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
  }

  listen(db) {
    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;

      this.bot.sendMessage(chatId, `/list: list the makers you follow\n/follow @username\n/unfollow @username`);
    });

    // /list command
    this.bot.onText(/\/list/, async (msg) => {
      const chatId = msg.chat.id;

      let follows = await db.getMakers();

      this.bot.sendMessage(chatId, `Makers you follow: ${follows.join(", ")}`);
    });

    // /unfollow command
    this.bot.onText(/\/unfollow (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = match[1];

      const deleted = await db.removeMakerToFollow(username);

      let message = `You've unfollowed ${username}`;

      if (!deleted) {
        message = `Error: ${username} does not exist.`;
      }

      this.bot.sendMessage(chatId, message);
    });

    // /follow command
    this.bot.onText(/\/follow (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = match[1];

      const added = await db.addMakerToFollow(username);

      let message = `You now follow ${username}`;

      if (!added) {
        message = `Error: you already follow ${username}.`;
      }

      this.bot.sendMessage(chatId, message);
    });
  }

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
