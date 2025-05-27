BEGIN;


CREATE TABLE IF NOT EXISTS public.conversations
(
    id serial NOT NULL,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    last_message_at timestamp without time zone DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT unique_pair UNIQUE (user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS public.location_images
(
    id serial NOT NULL,
    location_id integer,
    image_url text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT location_images_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.locations
(
    id serial NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    has_centrala boolean DEFAULT false,
    has_parking boolean DEFAULT false,
    floor integer,
    year_built integer,
    address character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
    number_of_rooms smallint NOT NULL DEFAULT 0,
    geom geometry,
    CONSTRAINT locations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.messages
(
    id serial NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_read boolean DEFAULT false,
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.rooms
(
    id serial NOT NULL,
    location_id integer NOT NULL,
    description text COLLATE pg_catalog."default",
    price numeric NOT NULL,
    balcony boolean DEFAULT false,
    sex_preference character varying(20) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rooms_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    username character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) COLLATE pg_catalog."default" DEFAULT 'user'::character varying,
    profile_picture_url text COLLATE pg_catalog."default",
    gender character varying(25) COLLATE pg_catalog."default" DEFAULT 'undefined'::character varying,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

ALTER TABLE IF EXISTS public.conversations
    ADD CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.conversations
    ADD CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.location_images
    ADD CONSTRAINT location_images_location_id_fkey FOREIGN KEY (location_id)
    REFERENCES public.locations (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.locations
    ADD CONSTRAINT locations_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id)
    REFERENCES public.conversations (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rooms
    ADD CONSTRAINT rooms_location_id_fkey FOREIGN KEY (location_id)
    REFERENCES public.locations (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;