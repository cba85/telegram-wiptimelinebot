const puppeteer = require("puppeteer");

exports.browse = async (looks, maxPage = 1) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const content = [];

  for (i = 1; i <= maxPage; i++) {
    await page.goto(`https://wip.co/?page=${i}`);

    const todos = await page.evaluate((looks) => {
      // Create todo storage
      let todo = [];

      // Get todos
      const elements = document.getElementsByClassName("todo--completed");

      for (const element of elements) {
        // Get todo username
        const name = element.getElementsByClassName("todo__name")[0];
        const user = name.getElementsByTagName("a")[0].innerHTML;
        let username = name.getElementsByTagName("a")[0].href;
        username = username.replace("https://wip.co/", "");

        // Check if the todos belongs to an user I follow
        if (looks.includes(username)) {
          // Create todo item
          const t = {};
          t.attachments = [];
          t.id = element.dataset.todoId;
          t.username = username;

          // Get todo body
          let body = element.getElementsByClassName("todo__body")[0].innerHTML;

          // Remove images in body
          body = body.replace(/<img .*?>/g, "");

          t.body = body;

          // Get todo attachment (images)
          const attachments = element.getElementsByClassName("myAttachment");

          for (attachment of attachments) {
            const img = attachment
              .getElementsByTagName("img")[0]
              .getAttribute("src");
            t.attachments.push(img);
          }

          // Add todo item in todo collection
          todo.push(t);
        }
      }

      return todo;
    }, looks);

    content.push(...todos);
  }

  await browser.close();

  return content;
};
