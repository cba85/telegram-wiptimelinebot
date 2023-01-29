const axios = require("axios");
const cheerio = require("cheerio");

exports.browse = async (follows, maxPage = 1) => {
  let todos = [];

  for (i = 1; i <= maxPage; i++) {
    const url = `https://wip.co/?page=${i}`;
    let body;

    try {
      const response = await axios.get(url);
      body = response.data;
    } catch (e) {
      throw new Error(`Fetch error ${e.response.status}`);
    }

    const $ = cheerio.load(body);

    const divs = $(".contents").find("turbo-frame");

    divs.each((index, turboFrame) => {
      const usernameElement = $(turboFrame).find(
        "div .flex .gap-2 .items-center > a[data-controller]"
      );

      let username = usernameElement.attr("href");

      if (!username) {
        return;
      }

      username = username.replace("/", "");

      if (!follows.includes(username)) {
        return;
      }

      // Create todo item
      let t = {};
      t.images = [];
      t.videos = [];
      t.id = $(turboFrame).attr("data-todo-id");
      t.username = username;

      // Regexes
      const regexDataHovercardUrlValue =
        /data-hovercard-url-value="(.|\n)*?"/gm;
      const regexStyle = /<style>(.|\n)*?<\/style>/gm;
      const regexClass = /class="(.|\n)*?"/gm;
      const regexStyle2 = /style="(.|\n)*?"/gm;

      // Get todo body
      const bodyElement = $(turboFrame).find("div .text-lg");
      let body = bodyElement.html();

      // Remove useless HTML tag to avoid problems when sending messages on Telegram
      body = body.replace(regexStyle, "");
      body = body.replace(regexClass, "");
      body = body.replace(regexStyle2, "");
      body = body.replace(regexDataHovercardUrlValue, "");
      body = body.replaceAll(`<span >`, "");
      body = body.replaceAll(`</span>`, "");
      body = body.replaceAll(`data-controller="hovercard"`, "");
      body = body.replaceAll(`rel="nofollow noopener"`, "");
      body = body.replace(/ +(?= )/g, "");

      // Remove images in body
      t.body = body.replace(/<img .*?>/g, "");

      // Get todo images
      const imagesElement = $(turboFrame).find("img");

      imagesElement.each((index, img) => {
        const srcsets = $(img).attr("srcset");

        if (!srcsets) {
          return;
        }

        const width = $(img).attr("width");

        if (width == 25 || width == 40) {
          return;
        }

        // Get high res images
        const srcset = srcsets.split(",");
        const maxSrcset = srcset[srcset.length - 1].trim().split(" ");
        t.images.push(maxSrcset[0]);
      });

      // Get todo videos
      const videosElement = $(turboFrame).find("source");

      videosElement.each((index, video) => {
        const src = $(video).attr("src");
        t.videos.push(src);
      });

      todos.push(t);
    });
  }

  return todos;
};
