# WIP.co telegram timeline

Create your custom [WIP.co](https://wip.co/) completed todos timeline of your favorite makers on Telegram.

🤖 To use the bot, just add WipTimelineBot on Telegram !

---

This is a simple app to parse [WIP.co](https://wip.co/) website, get your favorite makers completed todos, and send them on Telegram using a Telegram bot.

This app doesn't require an active account on the website because it doesn't use wip.co API, but scrap wip.co website instead using [pupeeter](https://pptr.dev/).

This app contains 2 entry points:

-   `index.js`: Telegram bot listener using webhooks (for Heroku deployment)
-   `main.js`: Telegram bot listener using polling (for local environment)

It also contains 2 scripts located in `bin/` folder:

-   `clean.js`: remove todos saved in database older than a week to clean database
-   `parse.js`: scraper to parse [WIP.co] todos

## Requirements

-   A PostgreSQL or MySQL server
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

Create a PostgreSQL or MySQL table based on the MySQL or PostgreSQL schema located in `db/` folder.

#### PostgreSQL database

Specify using a PostgreSQL server in `.env` file:

```
DATABASE_DRIVER=PGSQL
```

> If using this script locally, comment `PGSSLMODE=no-verify`.

#### MySQL database

Specify using a MySQL server in `.env` file:

```
DATABASE_DRIVER=MYSQL
```

## Usage

Launch bot:

```
$ node main.js
```

In your Telegram bot, add usernames you want to follow using `/follow @username` command.

Then launch the script to parse and get [WIP.co](https://wip.co/) todos of these users inside your Telegram bot:

```
$ node bin.parse.js [MAX_PAGE_TO_SCRAP]
```

Default max page to scrap is 1.

Use a cron scheduler to automatically receive updates (completed todos) from your favorite makers.

## Bot commands

-   `/start` : list commands available
-   `/list`: list the makers you follow
-   `/follow @username`: follow @username
-   `/unfollow @username`: unfollow @username
-   `/debug`: get Telegram chatId and username

## Deploy on Heroku

The project is already configured for Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Manual deployment

You just need to add node and [pupeeter](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku) buildpack.

Then, set up your env credentials based on `.env.example` file. Set up `APP_ENV=heroku`. You don't need to setup `PG_*` for PostgreSQL credentials because the script will automatically use Heroku `DATABASE_URL`.

> You should use my [heroku-dotenv](https://github.com/cba85/heroku-dotenv) package to copy `.env` variables to Heroku environment variables.

On Heroku, It's better to use `DATABASE_URL` instead default `PG_*` environment credentials because of this:

> Maintenance is required for your database
>
> Your database DATABASE_URL on wip-telegram requires maintenance. During this period, your database will become read-only. Once maintenance has completed, your database credentials and hostname will have changed, but we will update your app’s config variables accordingly to reflect the new database connection string.
>
> This automated maintenance is a necessary part of our Hobby tier plans, Dev and Basic. Should you need more control over maintenance windows, a production database (Standard tier or higher) offers more control over database maintenance, as we are able to schedule them in advance and provide better tools for self-served maintenance.

### Configuration

Add Heroku PostgreSQL addon, connect on your database using an app like [Postico](https://eggerapps.at/postico/) or [TablePlus](https://tableplus.com/), and create the database schema using queries inside the `db/` folder.

Your app is now ready.

> On Heroku, the web dyno uses `index.js` file and not `main.js` because this app will make Telegram bot uses "webhooks" on Heroku instead "polling" on local.

You should now open Heroku console and launch `heroku run node job.js` to test your app and start to parse some updates from your favorite makers. Don't forget to add usernames you want to follow in your Telegram bot using `/follow @username` command.

When the app works correctly, add Heroku scheduler addon and create a job every 10 min (or hours) for `bin/parse.js` to receive updates on your Telegram bot automatically.

Add also a daily cron job for `bin/clean.js` to maintain a clean database.

### MySQL

This projet is configured for using a Heroku PostgreSQL server.

If you prefer to use a MySQL server plugin for Heroku (like JawsDB Maria / JawsDB MySQL / ClearDB MySQL), you have to set up your env credentials based on [this part of the documentation](#mysql-database).

### Resources

-   PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
-   Pupeeter: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku
-   Heroku Telegram Bot: https://github.com/odditive/heroku-node-telegram-bot
