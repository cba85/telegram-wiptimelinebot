CREATE TABLE wip_follows (
    username varchar(255) NOT NULL,
    user_id int NOT NULL,
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT
);

CREATE TABLE wip_todos (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    body text NOT NULL,
    images text,
    todo_id int NOT NULL,
    videos text,
    created_at timestamp NOT NULL DEFAULT now(),
    user_id int NOT NULL
);

CREATE TABLE wip_users (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    first_name varchar(255),
    last_name varchar(255),
    is_bot tinyint NOT NULL,
    language_code varchar(255),
    date timestamp NOT NULL DEFAULT now()
);