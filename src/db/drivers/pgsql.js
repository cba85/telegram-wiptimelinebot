const { Client } = require("pg");

module.exports = class Pgsql {
  constructor() {
    return (async () => {
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });
      this.client.connect();

      return this;
    })();
  }

  // Check if connected Telegram user exists
  async checkIfUserExists(id) {
    const res = await this.client.query("SELECT * from users WHERE id = $1", [
      id,
    ]);

    return res.rowCount;
  }

  // Get all Telegram users (used for checking WIP.co todos)
  async getUsers() {
    const res = await this.client.query({
      text: "SELECT * from users",
    });

    return res.rows;
  }

  // Get user by Telegram user id
  async getUser(id) {
    const res = await this.client.query("SELECT * from users WHERE id = $1", [
      id,
    ]);

    if (!res.rowCount) {
      return false;
    }

    return res.rows[0];
  }

  // Create a user in database from Telegram
  async createUser(user) {
    const res = await this.client.query(
      "INSERT INTO users(id, username, first_name, last_name, is_bot, language_code) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        user.id,
        user.username,
        user.first_name,
        user.last_name,
        user.is_bot,
        user.language_code,
      ]
    );

    return res.rows[0];
  }

  // Count followers for a user
  async countFollowers(userId) {
    const res = await this.client.query(
      "SELECT * from follows WHERE user_id = $1",
      [userId]
    );

    return res.rowCount;
  }

  // Get followers for a user
  async getFollowers(id) {
    const res = await this.client.query({
      rowMode: "array",
      text: "SELECT username from follows WHERE user_id = $1",
      values: [id],
    });

    return res.rows.map((item) => item[0]);
  }

  // Get a specific follower for a user
  async getFollower(id, username) {
    const res = await this.client.query(
      "SELECT * from follows WHERE user_id = $1 AND username = $2",
      [id, username]
    );

    if (!res.rowCount) {
      return false;
    }

    return res.rows[0];
  }

  // Unfollow a wip.co maker
  async unfollowMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (!maker) {
      return false;
    }

    await this.client.query("DELETE FROM follows WHERE id = $1", [maker.id]);

    return true;
  }

  // Follow a wip.co maker
  async followMaker(id, username) {
    const maker = await this.getFollower(id, username);

    if (maker) {
      return false;
    }

    const res = await this.client.query(
      "INSERT INTO follows(user_id, username) VALUES($1, $2) RETURNING *",
      [id, username]
    );

    return res.rows[0];
  }

  // Save a completed todo from wip.co in database
  async saveTodo(userId, { id, username, body, images, videos }) {
    const res = await this.client.query(
      "INSERT INTO todos(user_id, todo_id, username, body, images, videos) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        userId,
        id,
        username,
        body,
        JSON.stringify(images),
        JSON.stringify(videos),
      ]
    );

    return res.rows[0];
  }

  // Check if a todo exists in database already
  async existsTodo(userId, todoId) {
    const res = await this.client.query(
      "SELECT * from todos WHERE user_id = $1 AND todo_id = $2",
      [userId, todoId]
    );

    return res.rowCount;
  }

  // Delete todos older than a week (7 days)
  async cleanTodos() {
    const res = await this.client.query(
      "DELETE FROM todos WHERE created_at < now() - interval '7 days'"
    );

    return res.rowCount;
  }
};
