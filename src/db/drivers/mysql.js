const mariadb = require("mariadb");

module.exports = class Mysql {
  constructor() {
    return (async () => {
      this.conn = await mariadb.createConnection({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
      });

      return this;
    })();
  }

  // Check if connected Telegram user exists
  async checkIfUserExists(id) {
    const res = await this.conn.query("SELECT * from wip_users WHERE id = ?", [
      id,
    ]);

    return res.length;
  }

  // Get all Telegram users (used for checking WIP.co todos)
  async getUsers() {
    const res = await this.conn.query("SELECT * from wip_users");

    return res;
  }

  // Get user by Telegram user id
  async getUser(id) {
    const res = await this.conn.query("SELECT * from wip_users WHERE id = ?", [
      id,
    ]);

    if (!res.length) {
      return false;
    }

    return res[0];
  }

  // Create a user in database from Telegram
  async createUser(user) {
    const res = await this.conn.query(
      "INSERT INTO wip_users(id, username, first_name, last_name, is_bot, language_code) VALUES(?, ?, ?, ?, ?, ?)",
      [
        user.id,
        user.username,
        user.first_name,
        user.last_name,
        user.is_bot,
        user.language_code,
      ]
    );

    return res[0];
  }

  // Count followers for a user
  async countFollowers(userId) {
    const res = await this.conn.query(
      "SELECT * from wip_follows WHERE user_id = ?",
      [userId]
    );

    return res.length;
  }

  // Get followers for a user
  async getFollowers(id) {
    const res = await this.conn.query(
      "SELECT username from wip_follows WHERE user_id = ?",
      [id]
    );

    return res.map((item) => item.username);
  }

  // Get a specific follower for a user
  async getFollower(id, username) {
    const res = await this.conn.query(
      "SELECT * from wip_follows WHERE user_id = ? AND username = ?",
      [id, username]
    );

    if (!res.length) {
      return false;
    }

    return res[0];
  }

  // Unfollow a wip.co maker
  async unfollowMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (!maker) {
      return false;
    }

    await this.conn.query("DELETE FROM wip_follows WHERE id = ?", [maker.id]);

    return true;
  }

  // Follow a wip.co maker
  async followMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (maker) {
      return false;
    }

    const res = await this.conn.query(
      "INSERT INTO wip_follows(user_id, username) VALUES(?, ?)",
      [id, username]
    );

    return res[0];
  }

  // Save a completed todo from wip.co in database
  async saveTodo(userId, { id, username, body, images, videos }) {
    const res = await this.conn.query(
      "INSERT INTO wip_todos(user_id, todo_id, username, body, images, videos) VALUES(?, ?, ?, ?, ?, ?)",
      [
        userId,
        id,
        username,
        body,
        JSON.stringify(images),
        JSON.stringify(videos),
      ]
    );

    return res[0];
  }

  // Check if a todo exists in database already
  async existsTodo(userId, todoId) {
    const res = await this.conn.query(
      "SELECT * from wip_todos WHERE user_id = ? AND todo_id = ?",
      [userId, todoId]
    );

    return res.length;
  }

  // Delete todos older than a week (7 days)
  async cleanTodos() {
    const count = await this.conn.query(
      "SELECT COUNT(*) as total FROM wip_todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    await this.conn.query(
      "DELETE FROM wip_todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    return count[0].total;
  }
};
