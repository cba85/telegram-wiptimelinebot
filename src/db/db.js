const Mysql = require("./drivers/mysql");
const MariaDb = require("./drivers/mariadb");
const Pgsql = require("./drivers/pgsql");

module.exports = class Db {
  db = null;

  constructor() {
    return (async () => {
      const availableDrivers = ["mysql", "pgsql", "mariadb"];

      if (!availableDrivers.includes(process.env.DATABASE_DRIVER)) {
        throw new Error("Invalid database driver (mysql, mariadb or pgsql)");
      }

      if (process.env.DATABASE_DRIVER == "mysql") {
        this.db = await new Mysql();
      } else if (process.env.DATABASE_DRIVER == "mariadb") {
        this.db = await new MariaDb();
      } else if (process.env.DATABASE_DRIVER == "pgsql") {
        this.db = await new Pgsql();
      }

      return this;
    })();
  }

  // Check if connected Telegram user exists
  async checkIfUserExists(id) {
    return await this.db.checkIfUserExists(id);
  }

  // Get all Telegram users (used for checking WIP.co todos)
  async getUsers() {
    return await this.db.getUsers();
  }

  // Get user by Telegram user id
  async getUser(id) {
    return await this.db.getUser(id);
  }

  // Create a user in database from Telegram
  async createUser(user) {
    return await this.db.createUser(user);
  }

  // Count followers for a user
  async countFollowers(userId) {
    return await this.db.countFollowers(userId);
  }

  // Get followers for a user
  async getFollowers(id) {
    return await this.db.getFollowers(id);
  }

  // Get a specific follower for a user
  async getFollower(id, username) {
    return await this.db.getFollower(id, username);
  }

  // Unfollow a wip.co maker
  async unfollowMaker(id, username) {
    return await this.db.unfollowMaker(id, username);
  }

  // Follow a wip.co maker
  async followMaker(id, username) {
    return await this.db.followMaker(id, username);
  }

  // Save a completed todo from wip.co in database
  async saveTodo(userId, todo) {
    return await this.db.saveTodo(userId, todo);
  }

  // Check if a todo exists in database already
  async existsTodo(userId, todoId) {
    return await this.db.existsTodo(userId, todoId);
  }

  // Delete todos older than a week (7 days)
  async cleanTodos() {
    return await this.db.cleanTodos();
  }
};
