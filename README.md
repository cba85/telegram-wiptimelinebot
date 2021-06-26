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
$ node main.js
```