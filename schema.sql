-- -------------------------------------------------------------
-- TablePlus 4.6.0(406)
--
-- https://tableplus.com/
--
-- Database: wip_telegram
-- Generation Time: 2022-03-01 20:06:20.3430
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS follows_id_seq1;

-- Table Definition
CREATE TABLE "public"."follows" (
    "username" varchar(255) NOT NULL,
    "user_id" varchar NOT NULL,
    "id" int4 NOT NULL DEFAULT nextval('follows_id_seq1'::regclass)
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS todos_id_seq;

-- Table Definition
CREATE TABLE "public"."todos" (
    "id" int4 NOT NULL DEFAULT nextval('todos_id_seq'::regclass),
    "username" varchar(255) NOT NULL,
    "body" text NOT NULL,
    "images" text,
    "todo_id" int4 NOT NULL,
    "videos" text,
    "created_at" timestamp(0) NOT NULL DEFAULT now(),
    "user_id" varchar NOT NULL
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."users" (
    "id" varchar NOT NULL,
    "username" varchar NOT NULL,
    "first_name" varchar,
    "last_name" varchar,
    "is_bot" bool NOT NULL,
    "language_code" varchar,
    "date" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

