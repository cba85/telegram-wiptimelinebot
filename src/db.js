const { Client } = require("pg");

module.exports = class Db {
  constructor() {
    this.client = new Client();
  }

  async connect() {
    await this.client.connect();
  }

  async getMakers() {
    const res = await this.client.query({
      rowMode: "array",
      text: "SELECT username from follows",
    });

    return res.rows.map((item) => item[0]);
  }

  async getMaker(username) {
    const res = await this.client.query("SELECT * from follows WHERE username = $1", [username]);

    if (!res.rowCount) {
      return false;
    }

    return res.rows[0];
  }

  async removeMakerToFollow(username) {
    const maker = await this.getMaker(username);
    
    if (!maker) {
      return false;
    }

    await this.client.query("DELETE FROM follows WHERE id = $1", [maker.id]);

    return true;
  }

  async addMakerToFollow(username) {
    const maker = await this.getMaker(username);
    
    if (maker) {
      return false;
    }

    const res = await this.client.query("INSERT INTO follows(username) VALUES($1) RETURNING *", [username]);

    return res.rows[0];
  }

  async saveTodo({ id, username, body, images, videos }) {
    const res = await this.client.query(
      "INSERT INTO todos(todo_id, username, body, images, videos) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [id, username, body, JSON.stringify(images), JSON.stringify(videos)]
    );

    return res.rows[0];
  }

  async existsTodo(todoId) {
    const res = await this.client.query("SELECT * from todos WHERE todo_id = $1", [todoId]);

    return res.rowCount;
  }
};
