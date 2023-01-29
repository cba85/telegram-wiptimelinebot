require("dotenv").config();

const { browse } = require("../src/parser");
const Db = require("../src/db/db");

(async () => {
  const db = await new Db();

  // Get users
  const users = await db.getUsers();

  for (user of users) {
    const follows = await db.getFollowers(user.id);

    const todos = await browse(follows, 1);

    console.log(todos);
  }

  process.exit();
})();
