const { Client } = require("pg");

module.exports = class Db {
  constructor() {
    this.client = new Client({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
      host: process.env.PGHOST,
      ssl: process.env.PGSSL,
    });
  }

  async connect() {
    await this.client.connect();
  }

  async getUsersToFollow() {
    const res = await this.client.query({
      rowMode: "array",
      text: "SELECT username from follows",
    });
    return res.rows.map((item) => item[0]);
  }

  async saveTodo({ id, username, body, images, videos }) {
    const res = await this.client.query(
      "INSERT INTO todos(todo_id, username, body, images, videos) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [id, username, body, JSON.stringify(images), JSON.stringify(videos)]
    );
    return res.rows[0];
  }

  async existsTodo(todoId) {
    const res = await this.client.query(
      "SELECT * from todos WHERE todo_id = $1",
      [todoId]
    );
    return res.rowCount;
  }
};
