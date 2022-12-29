require("dotenv").config();
const Mysql = require("../src/db/drivers/mysql");

(async () => {
  process.env.APP_ENV = "heroku";
  process.env.DATABASE_DRIVER = "mysql";

  const mysql = await new Mysql();

  console.log(await mysql.getUsers());

  process.exit();
})();
