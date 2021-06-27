# WIP.co telegram timeline

Create your own [WIP.co](https://wip.co/) todos timeline of your favorite makers on Telegram .

This is a simple script to parse [WIP.co](https://wip.co/) website, get your favorite makers todos, and send them on Telegram using a Telegram bot.

## Requirements

- A PostgreSQL server
- A Telegram bot

## Install

```
$ npm i install
```

Create a `.env` file based on `.env.example` file:

```bash
cp -v .env.example .env
```

Add your database and Telegram credentials into the `.env` file.

Create a PostgreSQL table based on `schema.sql` file.

## Usage

Insert usernames you want to follow in the `follows` table (e.g. @marc, @levelsio).

Then launch the script to parse and get [WIP.co](https://wip.co/) todos of these users inside your Telegram bot:

```
$ node job.js
```

## Deploy on Heroku

The project is already configured for Heroku.

You just need to add node and [pupeeter](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku) buildpack.

Then, set up your env credentials based on `.env` file. Don't forget to add `PGSSLMODE=no-verify` for Heroku PostgreSQL.

Add Heroku PostgreSQL addon, connect on your database using an app like [Postico](https://eggerapps.at/postico/) or [TablePlus](https://tableplus.com/), and create the database schema using queries inside the `schema.sql` file.

Insert makers usernames you want to follow (e.g. @marc).

Your app is now ready.

You should now open Heroku console and launch `heroku run node job.js` to test your app.

When the app works correctly, add Heroku scheduler addon and create a job every 10 min (or hours) to receive updates on your Telegram bot automatically.

### Resources

- PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
- Pupeeter: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku
