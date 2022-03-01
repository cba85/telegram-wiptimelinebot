const { Client } = require("pg");

module.exports = class Db {
  constructor() {
    if (process.env.APP_ENV == "heroku") {
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    } else {
      this.client = new Client();
    }
  }

  async connect() {
    await this.client.connect();
  }

  async checkUser(id) {
    const res = await this.client.query("SELECT * from users WHERE id = $1", [
      id,
    ]);

    return res.rowCount;
  }

  async getUsers() {
    const res = await this.client.query({
      rowMode: "array",
      text: "SELECT id from users",
    });

    return res.rows.map((item) => item[0]);
  }

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

  async getMakers(id) {
    const res = await this.client.query({
      rowMode: "array",
      text: "SELECT username from follows WHERE user_id = $1",
      values: [id],
    });

    return res.rows.map((item) => item[0]);
  }

  async getMaker(id, username) {
    const res = await this.client.query(
      "SELECT * from follows WHERE user_id = $1 AND username = $2",
      [id, username]
    );

    if (!res.rowCount) {
      return false;
    }

    return res.rows[0];
  }

  async unfollowMaker(id, username) {
    const maker = await this.getMaker(id, username);

    if (!maker) {
      return false;
    }

    await this.client.query("DELETE FROM follows WHERE id = $1", [maker.id]);

    return true;
  }

  async followMaker(id, username) {
    const maker = await this.getMaker(id, username);

    if (maker) {
      return false;
    }

    const res = await this.client.query(
      "INSERT INTO follows(user_id, username) VALUES($1, $2) RETURNING *",
      [id, username]
    );

    return res.rows[0];
  }

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

  async existsTodo(userId, todoId) {
    const res = await this.client.query(
      "SELECT * from todos WHERE user_id = $1 AND todo_id = $2",
      [userId, todoId]
    );

    return res.rowCount;
  }
};
