require("dotenv").config();
const Db = require("../src/db.js");

(async () => {
	const db = new Db();

	const removedTodosCount = await db.cleanTodos();
	console.log(`${removedTodosCount} todo(s) deleted.`);

	// Kill scripts after some times to give telegram API time to send messages
	setTimeout(function () {
		console.log("🤖✅ Clean todos older than a week job done");
		process.exit();
	}, 5000);
})();
