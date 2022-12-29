require("dotenv").config();
const Db = require("../src/db/db.js");

(async () => {
  const db = await new Db();

  process.exit();
})();
