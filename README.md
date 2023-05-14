# WIP.co telegram timeline

Create your custom [WIP.co](https://wip.co/) completed todos timeline of your favorite makers on Telegram.

🤖 To use the bot, just add [WipTimelineBot](https://t.me/WipTimelineBot) on Telegram !

---

This is a simple app to parse [WIP.co](https://wip.co/) website, get your favorite makers completed todos, and send them on Telegram using a Telegram bot.

This app doesn't require an active account on the website because it doesn't use wip.co API, but scraps wip.co website instead using [cheerio](https://cheerio.js.org/).

This app contains a entry point `index.js` that is the Telegram bot listener.

It also contains 2 scripts located in `bin/` folder:

-   `clean.js`: remove todos saved in database older than a week to clean database
-   `parse.js`: scraper to parse [WIP.co](https://wip.co/) todos

## Requirements

-   A MySQL server
-   A Telegram bot (create your own bot using Telegram's BotFather and grab your TOKEN)

## Install

```
$ npm install
```

Create a `.env` file based on `.env.example` file:

```bash
cp -v .env.example .env
```

Add your database and Telegram credentials into the `.env` file.

### Database

Create a MySQLtable based on the MySQL schema located in `db/` folder.

## Usage

Launch bot:

```
$ node index.js
```

In your Telegram bot, add usernames you want to follow using `/follow @username` command.

Then launch the script to parse and get [WIP.co](https://wip.co/) todos of these users inside your Telegram bot:

```
$ node bin.parse.js [MAX_PAGE_TO_SCRAP]
```

Default max page to scrap is 1.

Use a cron scheduler to automatically receive updates (completed todos) from your favorite makers.

## Commands

-   `/start` : list commands available
-   `/following`: list makers you follow
-   `/follow @username`: follow @username
-   `/unfollow @username`: unfollow @username
-   `/debug`: get Telegram chatId and username

### Telegram commands list

```txt
start - Main menu
following - list makers you follow
follow - follow a maker
unfollow - unfollow a maker
debug - Debug mode
```

## Resources

-   PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js *(not using Heroku and PostgreSQL anymore)*
-   Pupeeter: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku *(replaced by Cheerio)*
-   Heroku Telegram Bot: https://github.com/odditive/heroku-node-telegram-bot *(not using Heroku anymore)*
