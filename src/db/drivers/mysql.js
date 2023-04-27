const mysql = require("mysql2/promise");

module.exports = class Mysql {
  constructor() {
    return (async () => {
      this.connection = await mysql.createConnection(process.env.DATABASE_URL);
      return this;
    })();
  }

  // Check if connected Telegram user exists
  async checkIfUserExists(id) {
    const [rows] = await this.connection.execute(
      "SELECT COUNT(*) as total from wip_users WHERE id = ?",
      [id]
    );

    return rows[0].total;
  }

  // Get all Telegram users (used for checking WIP.co todos)
  async getUsers() {
    const [rows] = await this.connection.execute("SELECT * from wip_users");

    return rows;
  }

  // Get user by Telegram user id
  async getUser(id) {
    const [rows] = await this.connection.execute(
      "SELECT * from wip_users WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return false;
    }

    return rows[0];
  }

  // Create a user in database from Telegram
  async createUser(user) {
    await this.connection.execute(
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

    return true;
  }

  // Count followers for a user
  async countFollowers(userId) {
    const [rows] = await this.connection.execute(
      "SELECT COUNT(*) as total from wip_follows WHERE user_id = ?",
      [userId]
    );

    return rows[0].total;
  }

  // Get followers for a user
  async getFollowers(id) {
    const [rows] = await this.connection.execute(
      "SELECT username from wip_follows WHERE user_id = ?",
      [id]
    );

    return rows.map((item) => item.username);
  }

  // Get a specific follower for a user
  async getFollower(id, username) {
    const [rows] = await this.connection.execute(
      "SELECT * from wip_follows WHERE user_id = ? AND username = ?",
      [id, username]
    );

    if (!rows.length) {
      return false;
    }

    return rows[0];
  }

  // Unfollow a wip.co maker
  async unfollowMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (!maker) {
      return false;
    }

    await this.connection.execute("DELETE FROM wip_follows WHERE id = ?", [
      maker.id,
    ]);

    return true;
  }

  // Follow a wip.co maker
  async followMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (maker) {
      return false;
    }

    await this.connection.execute(
      "INSERT INTO wip_follows(user_id, username) VALUES(?, ?)",
      [id, username]
    );

    return true;
  }

  // Save a completed todo from wip.co in database
  async saveTodo(userId, { id, username, body, images, videos }) {
    await this.connection.execute(
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

    return true;
  }

  // Check if a todo exists in database already
  async existsTodo(userId, todoId) {
    const [rows] = await this.connection.execute(
      "SELECT COUNT(*) as total from wip_todos WHERE user_id = ? AND todo_id = ?",
      [userId, todoId]
    );

    return rows[0].total;
  }

  // Delete todos older than a week (7 days)
  async cleanTodos() {
    const count = await this.connection.execute(
      "SELECT COUNT(*) as total FROM wip_todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    await this.connection.execute(
      "DELETE FROM wip_todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    return count[0].total;
  }
};
