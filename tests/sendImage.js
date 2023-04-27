require("dotenv").config();

const axios = require("axios");
const Telegram = require("../src/telegram");

if (process.argv.length != 4) {
  console.log("Usage: node tests/sendPhoto.js telegram_user_id photo_url");
  return;
}

(async () => {
  const telegramBot = new Telegram("polling");

  const chatId = process.argv[2];
  const photoUrl = process.argv[3];

  // Check if image is in webp format hidden in jpg format
  const res = await axios.request({
    url: photoUrl,
    method: "get",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36",
    },
  });

  console.log(`📸 Photo: ${res.headers["content-type"]}`);

  if (res.headers["content-type"] == "image/webp") {
    // Send sticker
    try {
      await telegramBot.bot.sendSticker(chatId, photoUrl);
    } catch (error) {
      console.log(`❌ Sticker\n${error.response.body.description}`);
    }
  } else {
    // Send photo
    try {
      await telegramBot.bot.sendPhoto(chatId, photoUrl);
    } catch (error) {
      console.log(`❌ Photo\n${error.response.body.description}`);

      // Send sticker if error
      try {
        await telegramBot.bot.sendSticker(chatId, photoUrl);
      } catch (error) {
        console.log(`❌ Sticker\n${error.response.body.description}`);
      }
    }
  }
})();
