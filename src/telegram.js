const telegramBot = require("node-telegram-bot-api");
const request = require("request");

module.exports = class Telegram {
  constructor(type = null, db) {
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

    this.db = db;

    console.log(`Telegram bot server started in the ${type} mode`);
  }

  // Commands
  listen() {
    // /start
    // Create a user on first-time launch
    this.bot.onText(/\/start/, async (msg) => {
      const user = await this.db.checkIfUserExists(msg.chat.id);

      if (!user) {
        const added = await this.db.createUser(msg.from);
      }

      this.bot.sendMessage(
        msg.chat.id,
        `Create your own <a href="https://wip.co">wip.co</a> todos timeline of your favorite makers.\n\nCommands:\n/list: list the makers you follow\n/follow @username: follow a maker\n/unfollow @username: unfollow a maker`,
        { parse_mode: "HTML" }
      );
    });

    // /list
    // Send followers list
    this.bot.onText(/\/list/, async (msg) => {
      let follows = await this.db.getFollowers(msg.chat.id);

      if (!follows.length) {
        return this.bot.sendMessage(
          msg.chat.id,
          `😭 You don't follow any maker yet. Use "/follow @username" command to follow a wip.co maker.`
        );
      }

      const message = `✌️ You are following ${
        follows.length
      } makers: ${follows.join(", ")}`;

      return this.bot.sendMessage(msg.chat.id, message);
    });

    // /unfollow
    // Unfollow a maker
    this.bot.onText(/\/unfollow (.+)/, async (msg, match) => {
      const username = match[1];

      const deleted = await this.db.unfollowMaker(msg.chat.id, username);

      if (!deleted) {
        return this.bot.sendMessage(
          msg.chat.id,
          `🔴 Error: you don't follow ${username}.`
        );
      }

      return this.bot.sendMessage(
        msg.chat.id,
        `🙈 You've unfollowed ${username}`
      );
    });

    // /follow
    // Follow a maker (limit to 10)
    this.bot.onText(/\/follow (.+)/, async (msg, match) => {
      const username = match[1];

      // Check username format (@)
      if (!username.includes("@")) {
        return this.bot.sendMessage(msg.chat.id, `🟠 Typo: use @${username}.`);
      }

      // Check followers count limit
      const followersCount = await this.db.countFollowers(msg.chat.id);

      if (followersCount >= 10) {
        return this.bot.sendMessage(
          msg.chat.id,
          `😔 You can't follow more than 10 makers yet.`
        );
      }

      // Check if user already follow this maker
      const added = await this.db.followMaker(msg.chat.id, username);

      if (!added) {
        return this.bot.sendMessage(
          msg.chat.id,
          `🔴 Error: you already follow ${username}.`
        );
      }

      return this.bot.sendMessage(msg.chat.id, `👀 You now follow ${username}`);
    });
  }

  // Send Telegram message for a wip.co todo
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

    // Including images
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

    // Including videos
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
              // < 20 mb: send video file on Telegram
              try {
                this.bot.sendVideo(id, video, {
                  caption: message,
                  parse_mode: "html",
                });
              } catch (error) {
                console.log(error);
              }
            } else {
              // > 20mb: send video url on Telegram
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
