require("dotenv").config();
const Mysql = require("../src/db/drivers/mysql");

(async () => {
  const mysql = await new Mysql();

  process.exit();
})();
