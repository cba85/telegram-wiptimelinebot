const puppeteer = require("puppeteer");

exports.browse = async (follows, maxPage = 1) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    //headless: false,
  });
  const page = await browser.newPage();

  let content = [];

  for (i = 1; i <= maxPage; i++) {
    await page.goto(`https://wip.co/?page=${i}`);

    // Get todos
    const todos = await page.$$eval(
      "[data-todo-id]",
      (elements, follows) => {
        let todos = [];

        // Parse todos
        for (const element of elements) {
          // Get todo username
          let username = element.getElementsByClassName(
            "font-sm text-gray-500"
          )[0].textContent;

          // Check if the todos belongs to an user followed
          if (follows.includes(username)) {
            // Create todo item
            let t = {};
            t.images = [];
            t.videos = [];
            t.id = element.dataset.todoId;
            t.username = username;

            // Regexes
            const regexDataHovercardUrlValue =
              /data-hovercard-url-value="(.|\n)*?"/gm;
            const regexStyle = /<style>(.|\n)*?<\/style>/gm;
            const regexClass = /class="(.|\n)*?"/gm;
            const regexStyle2 = /style="(.|\n)*?"/gm;

            // Get todo body
            let body = element.getElementsByClassName("text-lg")[0].innerHTML;

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
            const images = element.getElementsByClassName(
              "grid grid-flow-row-dense gap-0.5"
            );

            for (const image of images) {
              // Get images
              const imgElements = image.getElementsByTagName("img");

              for (const imgElement of imgElements) {
                // Get high res images
                const srcset = imgElement.srcset.split(",");
                const maxSrcset = srcset[srcset.length - 1].trim().split(" ");
                t.images.push(maxSrcset[0]);
              }
            }

            // Get todo videos
            const videos = element.getElementsByClassName(
              "flex flex-col gap-1"
            );

            for (const video of videos) {
              // Get videos
              const videoElements = video.getElementsByTagName("source");

              for (const videoElement of videoElements) {
                t.videos.push(videoElement.getAttribute("src"));
              }
            }

            todos.push(t);
          }
        }

        return todos;
      },
      follows
    );

    content.push(...todos);
  }

  await browser.close();

  return content.reverse();
};
