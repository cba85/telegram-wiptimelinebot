CREATE SEQUENCE public.follows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.follows (
    id integer DEFAULT nextval('public.follows_id_seq'::regclass) NOT NULL,
    username character varying(255) NOT NULL
);

CREATE SEQUENCE public.todos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.todos (
    id integer DEFAULT nextval('public.todos_id_seq'::regclass) NOT NULL,
    username character varying(255) NOT NULL,
    body text NOT NULL,
    images text,
    todo_id integer NOT NULL,
    videos text,
    created_at timestamp(0) without time zone DEFAULT now()
);
