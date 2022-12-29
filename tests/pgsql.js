require("dotenv").config();
const Pgsql = require("../src/db/drivers/pgsql");

(async () => {
  const pgsql = await new Pgsql();

  process.exit();
})();
