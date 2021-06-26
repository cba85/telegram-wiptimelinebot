const { Client } = require("pg");

module.exports = class Db {
  constructor() {
    this.client = new Client();
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

  async saveTodo({ id, username, body, attachments }) {
    const res = await this.client.query(
      "INSERT INTO todos(todo_id, username, body, attachments) VALUES($1, $2, $3, $4) RETURNING *",
      [id, username, body, JSON.stringify(attachments)]
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
