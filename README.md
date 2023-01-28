# WIP.co telegram timeline

Create your custom [WIP.co](https://wip.co/) completed todos timeline of your favorite makers on Telegram.

🤖 To use the bot, just add WipTimelineBot on Telegram !

---

This is a simple app to parse [WIP.co](https://wip.co/) website, get your favorite makers completed todos, and send them on Telegram using a Telegram bot.

This app doesn't require an active account on the website because it doesn't use wip.co API, but scrap wip.co website instead using [pupeeter](https://pptr.dev/).

This app contains a entry point `index.js` that is the Telegram bot listener.

It also contains 2 scripts located in `bin/` folder:

-   `clean.js`: remove todos saved in database older than a week to clean database
-   `parse.js`: scraper to parse [WIP.co](https://wip.co/) todos

## Requirements

-   A PostgreSQL or MySQL/MariaDB server
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

Create a PostgreSQL or MySQL/MariaDB table based on the MySQL or PostgreSQL schema located in `db/` folder.

### MySQL database (default)

Specify using a MySQL server in `.env` file:

```
DATABASE_DRIVER=MYSQL
```

[mysql2](https://www.npmjs.com/package/mysql2) package is installed by default. If you need to reinstall the package:

```
$ npm install mysql2
```

### PostgreSQL database

Install [node-postgres](https://node-postgres.com/) package:

```
$ npm install pg
```

Specify using a PostgreSQL server in `.env` file:

```
DATABASE_DRIVER=PGSQL
```

> If using this script locally, comment `PGSSLMODE=no-verify`.

### MariaDB database

Install [mariadb](https://mariadb.com/kb/en/getting-started-with-the-nodejs-connector/) package:

```
$ npm install mariadb
```

Specify using a MariaDB server in `.env` file:

```
DATABASE_DRIVER=MARIADB
```

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
-   `/list`: list makers you follow
-   `/follow @username`: follow @username
-   `/unfollow @username`: unfollow @username
-   `/debug`: get Telegram chatId and username

### Telegram commands list

```txt
start - Main menu
list - list makers you follow
follow - follow a maker
unfollow - unfollow a maker
debug - Debug mode
```

## Deploy on Heroku

The project is already configured for Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Manual deployment

You just need to add node and [pupeeter](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku) buildpack.

Then, set up your env credentials based on `.env.example` file. Set up `APP_ENV=heroku`. You don't need to setup `MYSQL*` credentials for MySQL because the script will automatically use Heroku `JAWSDB_MARIA_URL`.

> You should use my [heroku-dotenv](https://github.com/cba85/heroku-dotenv) package to copy `.env` variables to Heroku environment variables.

### Configuration

Add JawsDB MariaDB addon, connect on your database using an app like [Postico](https://eggerapps.at/postico/) or [TablePlus](https://tableplus.com/), and create the database schema using queries inside the `db/` folder.

🚀 Your app is now ready.

You should now open Heroku console and launch `heroku run node job.js` to test your app and start to parse some updates from your favorite makers. Don't forget to add usernames you want to follow in your Telegram bot using `/follow @username` command.

When the app works correctly, add Heroku scheduler addon and create a job every 10 min (or hours) for `bin/parse.js` to receive updates on your Telegram bot automatically.

Add also a daily cron job for `bin/clean.js` to maintain a clean database.

### MySQL

This projet is configured to use a JawsDB MariaDB server.

If you prefer to use another MySQL server plugin for Heroku like JawsDB MySQL or ClearDB MySQL, you have to set up your env credentials based on [this part of the documentation](#mysql-database).

### Resources

-   PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
-   Pupeeter: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku
-   Heroku Telegram Bot: https://github.com/odditive/heroku-node-telegram-bot
