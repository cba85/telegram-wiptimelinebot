
CREATE SEQUENCE IF NOT EXISTS follows_id_seq1;

CREATE TABLE "public"."wip_follows" (
    "username" varchar(255) NOT NULL,
    "user_id" varchar NOT NULL,
    "id" int4 NOT NULL DEFAULT nextval('follows_id_seq1'::regclass)
);

CREATE SEQUENCE IF NOT EXISTS todos_id_seq;

CREATE TABLE "public"."wip_todos" (
    "id" int4 NOT NULL DEFAULT nextval('todos_id_seq'::regclass),
    "username" varchar(255) NOT NULL,
    "body" text NOT NULL,
    "images" text,
    "todo_id" int4 NOT NULL,
    "videos" text,
    "created_at" timestamp(0) NOT NULL DEFAULT now(),
    "user_id" int4 NOT NULL
);

CREATE TABLE "public"."wip_users" (
    "id" varchar NOT NULL,
    "username" varchar NOT NULL,
    "first_name" varchar,
    "last_name" varchar,
    "is_bot" bool NOT NULL,
    "language_code" varchar,
    "date" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
