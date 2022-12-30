const telegramBot = require("node-telegram-bot-api");
const { sendPhoto, sendVideo, sendMessage } = require("./send");
const { browse } = require("./parser");
const Db = require("./db/db");

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
        await this.db.createUser(msg.from);
      }

      this.bot.sendMessage(
        msg.chat.id,
        `Create your own <a href="https://wip.co">wip.co</a> todos timeline of your favorite makers.\n\nCommands:\n/list: list the makers you follow\n/follow @username: follow a maker\n/unfollow @username: unfollow a maker\n/debug: see parser logs`,
        { parse_mode: "HTML" }
      );
    });

    // /debug
    this.bot.onText(/\/debug/, async (msg) => {
      const db = await new Db();

      // Get current user
      const user = await db.getUser(msg.chat.id);

      let message = `\n👋 User: ${user.username} #${user.id}`;

      // Get the followers of the current user
      const follows = await db.getFollowers(user.id);
      message += `\n👀 Follows: `;
      for (const follow of follows) {
        message += `${follow} `;
      }

      const maxPage = 1;

      // Get todos from the makers followed by the current user
      const todos = await browse(follows, maxPage);

      message += `\n⬇️ ${todos.length} todos retrieved`;

      let countTodosSent = 0;
      for (const key in todos) {
        const todo = todos[key];
        const exists = await db.existsTodo(user.id, todo.id);

        if (!exists) {
          countTodosSent++;
        }
      }

      message += `\n💬 ${countTodosSent} new todos has to be send to Telegram`;

      return this.bot.sendMessage(msg.chat.id, message);
    });

    // /list
    // Send followers list
    this.bot.onText(/\/list/, async (msg) => {
      let follows = await this.db.getFollowers(msg.chat.id);

      if (!follows.length) {
        return this.bot.sendMessage(
          msg.chat.id,
          `😭 You are not following any maker yet. Use "/follow @username" command to follow a wip.co maker.`
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
          `🔴 Error: you are not following ${username}.`
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

      const added = await this.db.followMaker(msg.chat.id, username);

      // Check if user already follow this maker
      if (!added) {
        return this.bot.sendMessage(
          msg.chat.id,
          `🔴 Error: you are already following ${username}.`
        );
      }

      return this.bot.sendMessage(
        msg.chat.id,
        `👀 You are now following ${username}`
      );
    });
  }

  // Send Telegram message for a wip.co todo
  async sendMessage(chatId, todo) {
    const reply = await sendMessage(this.bot, chatId, todo);

    // Including images
    if (todo.images.length) {
      await sendPhoto(this.bot, chatId, reply, todo);
    }

    // Including videos
    if (todo.videos.length) {
      await sendVideo(this.bot, chatId, reply, todo);
    }
  }
};
