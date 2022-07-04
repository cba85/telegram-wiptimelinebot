const axios = require("axios");

// Send Telegram message text
exports.sendMessage = async (bot, chatId, { id, username, body }) => {
  const message = `<a href="https://wip.co/${username}">${username}</a>: ${body}\n🔗 <a href="https://wip.co/todos/${id}">Link</a>`;

  return await bot.sendMessage(chatId, message, {
    parse_mode: "html",
    disable_web_page_preview: true,
  });
};

// Send Telegram photo or sticker
exports.sendPhoto = async (bot, chatId, reply, { images }) => {
  // Including images
  for (let image of images) {
    // Check if image is in webp format hidden in jpg format
    const res = await axios.request({
      url: image,
      method: "get",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36",
      },
    });

    //console.log(`📸 Photo: ${res.headers["content-type"]}\n${image}`);

    if (res.headers["content-type"] == "image/webp") {
      try {
        await bot.sendSticker(chatId, image, {
          reply_to_message_id: reply.message_id,
        });
      } catch (error) {
        console.log(`❌ Sticker\n${error.response.body.description}\n${image}`);
      }
    } else {
      try {
        await bot.sendPhoto(chatId, image, {
          reply_to_message_id: reply.message_id,
        });
      } catch (error) {
        console.log(`❌ Photo\n${error.response.body.description}\n${image}`);
        // Send photo as a sticker if error
        await bot.sendSticker(chatId, image, {
          reply_to_message_id: reply.message_id,
        });
      }
    }
  }

  return;
};

exports.sendVideo = async (bot, chatId, reply, { videos }) => {
  for (let video of videos) {
    // Check Telegram video size limit (20mb)
    const res = await axios.request({
      url: video,
      method: "HEAD",
    });

    // < 20 mb: send video file on Telegram
    if (res.headers["content-length"] < 20000000) {
      try {
        await bot.sendVideo(chatId, video, {
          reply_to_message_id: reply.message_id,
        });
      } catch (error) {
        console.log(`❌ Video\n${error.response.body.description}\n${video}`);
      }
    } else {
      // > 20mb: send video url on Telegram
      const videoMessage = `${username}: <a href="${video}">▶️ video</a> – ${body}`;
      try {
        await bot.sendMessage(chatId, videoMessage, {
          reply_to_message_id: reply.message_id,
        });
      } catch (error) {
        console.log(
          `❌ Video url\n${error.response.body.description}\n${video}`
        );
      }
    }

    return;
  }
};
