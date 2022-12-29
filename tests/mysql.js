require("dotenv").config();
const Mysql = require("../src/db/drivers/mysql");

(async () => {
  process.env.APP_ENV = "local";
  process.env.DATABASE_DRIVER = "mysql";

  const mysql = await new Mysql();

  process.exit();
})();
