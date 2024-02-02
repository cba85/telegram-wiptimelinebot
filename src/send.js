const axios = require("axios");

// Send Telegram message text
exports.sendMessage = async (bot, chatId, { id, username, body }) => {
  const message = `<a href="https://wip.co/${username}">${username}</a>: ${body}\n<a href="https://wip.co/todos/${id}">Link</a>`;

  return await bot.sendMessage(chatId, message, {
    parse_mode: "html",
    disable_web_page_preview: true,
  });
};

// Send Telegram photo or sticker
exports.sendPhoto = async (bot, chatId, reply, { images }) => {
  for (let image of images) {
    await bot.sendPhoto(chatId, image, {
      reply_to_message_id: reply.message_id,
    });
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
        console.log(`🔴📹 Video\n${error.response.body.description}\n${video}`);
      }
    } else {
      // > 20mb: send video url on Telegram
      const videoMessage = `<a href="${video}">▶️ video</a>`;
      try {
        await bot.sendMessage(chatId, videoMessage, {
          reply_to_message_id: reply.message_id,
        });
      } catch (error) {
        console.log(
          `🔴📹 Video url\n${error.response.body.description}\n${video}`
        );
      }
    }

    return;
  }
};
