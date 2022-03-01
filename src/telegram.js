const telegramBot = require("node-telegram-bot-api");
const request = require("request");

module.exports = class Telegram {
  constructor(type = null) {
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

  // Commands
  listen(db) {
    // Checking on every messages
    this.bot.on("message", async (msg) => {
      const user = await db.checkUser(msg.chat.id);

      if (!user) {
        const added = await db.createUser(msg.from);
      }
    });

    // /start
    this.bot.onText(/\/start/, async (msg) => {
      this.bot.sendMessage(
        msg.chat.id,
        `Create your own <a href="https://wip.co">wip.co</a> todos timeline of your favorite makers.\n\nCommands:\n/list: list the makers you follow\n/follow @username: follow a maker\n/unfollow @username: unfollow a maker`,
        { parse_mode: "HTML" }
      );
    });

    // /debug
    this.bot.onText(/\/debug/, async (msg) => {
      this.bot.sendMessage(
        msg.chat.id,
        `chatId: ${msg.chat.id}\nusername: ${msg.chat.username}`
      );
    });

    // /list
    this.bot.onText(/\/list/, async (msg) => {
      let follows = await db.getMakers(msg.chat.id);

      let message = "";

      if (!follows.length) {
        message = `😭 You don't follow any maker yet. Use "/follow @username" command to follow a wip.co maker.`;
      } else {
        message = `✌️ Makers you follow: ${follows.join(", ")}`;
      }

      this.bot.sendMessage(msg.chat.id, message);
    });

    // /unfollow
    this.bot.onText(/\/unfollow (.+)/, async (msg, match) => {
      const username = match[1];

      const deleted = await db.unfollowMaker(msg.chat.id, username);

      let message = `🙈 You've unfollowed ${username}`;

      if (!deleted) {
        message = `🔴 Error: you don't follow ${username}.`;
      }

      this.bot.sendMessage(msg.chat.id, message);
    });

    // /follow
    this.bot.onText(/\/follow (.+)/, async (msg, match) => {
      const username = match[1];

      let message = `👀 You now follow ${username}`;

      if (!username.includes("@")) {
        message = `🟠 Typo: use @${username}.`;
      } else {
        const added = await db.followMaker(msg.chat.id, username);

        if (!added) {
          message = `🔴 Error: you already follow ${username}.`;
        }
      }

      this.bot.sendMessage(msg.chat.id, message);
    });
  }

  // Send Telegram Todo message
  sendMessage(id, { body, username, images, videos }) {
    const message = `${username}: ${body}`;

    // Text
    if (!images.length && !videos.length) {
      try {
        this.bot.sendMessage(id, message, {
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
          this.bot.sendPhoto(id, image, {
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
                this.bot.sendVideo(id, video, {
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
                this.bot.sendMessage(id, videoMessage, {
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
