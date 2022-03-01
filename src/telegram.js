const telegramBot = require("node-telegram-bot-api");
const request = require("request");

module.exports = class Telegram {
  constructor(type = null) {
    this.chatId = process.env.TELEGRAM_CHAT_ID;

    if (!type) {
      this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN);
    } else if (type == "polling") {
      this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN, {
        polling: true,
      });
    } else if (type == "webhook") {
      this.bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN);
      this.bot.setWebHook(process.env.APP_URL + this.bot.token);
    }

    console.log(`Telegram bot server started in the ${type} mode`);
  }

  listen(db) {
    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;

      this.bot.sendMessage(
        chatId,
        `/list: list the makers you follow\n/follow @username\n/unfollow @username`
      );
    });

    // /chatid command
    this.bot.onText(/\/chatid/, async (msg) => {
      const chatId = msg.chat.id;

      this.bot.sendMessage(chatId, `Telegram chatId: ${chatId}`);
    });

    // /list command
    this.bot.onText(/\/list/, async (msg) => {
      const chatId = msg.chat.id;

      let follows = await db.getMakers();

      this.bot.sendMessage(
        chatId,
        `✌️ Makers you follow: ${follows.join(", ")}`
      );
    });

    // /unfollow command
    this.bot.onText(/\/unfollow (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = match[1];

      const deleted = await db.removeMakerToFollow(username);

      let message = `🙈 You've unfollowed ${username}`;

      if (!deleted) {
        message = `🔴 Error: you don't follow ${username}.`;
      }

      this.bot.sendMessage(chatId, message);
    });

    // /follow command
    this.bot.onText(/\/follow (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = match[1];

      let message = `👀 You now follow ${username}`;

      if (!username.includes("@")) {
        message = `🟠 Typo: use @${username}.`;
      } else {
        const added = await db.addMakerToFollow(username);

        if (!added) {
          message = `🔴 Error: you already follow ${username}.`;
        }
      }

      this.bot.sendMessage(chatId, message);
    });
  }

  sendMessage({ body, username, images, videos }) {
    const message = `${username}: ${body}`;

    // Text
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

    // Images
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

    // Videos
    if (videos.length) {
      for (let video of videos) {
        // Check Telegram video size limit (20mb)
        request(
          {
            url: video,
            method: "HEAD",
          },
          (err, response) => {
            if (response.headers["content-length"] < 20000000) {
              // Send video file on Telegram
              try {
                this.bot.sendVideo(this.chatId, video, {
                  caption: message,
                  parse_mode: "html",
                });
              } catch (error) {
                console.log(error);
              }
            } else {
              // Send video url on Telegram
              const videoMessage = `${username}: <a href="${video}">▶️ video</a> – ${body}`;
              try {
                this.bot.sendMessage(this.chatId, videoMessage, {
                  parse_mode: "html",
                  disable_web_page_preview: true,
                });
              } catch (error) {
                console.log(error);
              }
            }
          }
        );

        return;
      }
    }
  }
};
