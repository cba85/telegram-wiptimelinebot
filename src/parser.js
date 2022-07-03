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
          const username = element.getElementsByClassName(
            "font-sm text-gray-500"
          )[0].innerHTML;

          // Check if the todos belongs to an user followed
          if (follows.includes(username)) {
            // Create todo item
            let t = {};
            t.images = [];
            t.videos = [];
            t.id = element.dataset.todoId;
            t.username = username;
            //t.attachments = [];

            // Get todo body
            let body = element.getElementsByClassName("text-lg")[0].innerHTML;

            // Remove images in body
            t.body = body.replace(/<img .*?>/g, "");

            // Get todo attachments
            const attachments = element.getElementsByClassName(
              "grid grid-flow-row-dense gap-0.5"
            );

            for (const attachment of attachments) {
              //t.attachments.push(attachment.innerHTML);

              // Get images
              const imgElements = attachment.getElementsByTagName("img");

              for (const imgElement of imgElements) {
                // Get high res images
                const srcset = imgElement.srcset.split(",");
                const maxSrcset = srcset[srcset.length - 1].trim().split(" ");
                t.images.push(maxSrcset[0]);
              }

              //TODOS: Get videos
              /*
              const videoElements = attachment.getElementsByTagName("source");
              if (videoElements.length) {
                const video = videoElements[0].getAttribute("src");
                t.videos.push(video);
              }
              */
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
