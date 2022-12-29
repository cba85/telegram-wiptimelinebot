require("dotenv").config();
const Pgsql = require("../src/db/drivers/pgsql");

(async () => {
  process.env.APP_ENV = "local";
  process.env.DATABASE_DRIVER = "pgsql";

  const pgsql = await new Pgsql();

  process.exit();
})();
