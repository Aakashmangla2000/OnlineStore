--
-- PostgreSQL database dump
-- --
-- # create a new empty database
-- createdb mydb_copy

-- # restore the backup to the new database
-- psql -U postgres -h localhost -p 5432 onlinestore < onlinestore.sql
-- Dumped from database version 13.10
-- Dumped by pg_dump version 15.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    "firstName" character varying(50) NOT NULL,
    "lastName" character varying(50),
    username text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    password text NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_id_seq OWNER TO postgres;

--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "totalPrice" numeric(14,2) NOT NULL,
    "productDetails" jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    location public.geography NOT NULL
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_id_seq OWNER TO postgres;

--
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_id_seq OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id, "firstName", "lastName", username, phone, address, password, "deletedAt") FROM stdin;
10	Test User 2	lastName	test-user-2	9876543210	Test User 2 Address	$2b$10$zKp/9sZpzEqUhDPecdkD7eFRdr4Lz3QeV/uxPLWvT8ZYi.KMKHF8q	2023-05-02 15:08:46.422+05:30
11	12	lastName	test-user-2	9876543210	Test User 2 Address	$2b$10$SYa/RdqizTD3.tThm6is5uXuvF6TOL0gEgSp3CiEn.7U8oLt6F9.6	\N
12	12	lastName	test-user-3	9876543210	Test User 2 Address	$2b$10$oAmmld6X0j3Tr1ZXV2/f2eJQn/jzi701VhJNkAYFksS8lvAbzAqFW	\N
13	12	lastName	test-user-4	9876543210	Test User 2 Address	$2b$10$MHGJjGVftIV5GLu4xgP6i.bdb3x2PqK5u75me.sE8TzWf0ev4S7vS	\N
14	firstName	13	test-user-5	9876543210	Test User 2 Address	$2b$10$1RbEbx/s3BGLzK7NuCfpV.VJ59i3k3RorUueRLRgT63sgMjeKd62i	\N
15	firstName	\N	test-user-00	9876543210	Test User 2 Address	$2b$10$3NqVJm3opnqMbROQ/XOXbOgwAsptXAvitret39I3iUHp8SFsPbA6q	\N
1	firstName	lastName	test-user-1	9876543210	Test User 1 new Address	$2b$10$px94/4yX9JGEsNY1jDsSK.8bwzYfSeSvrNpENHMf0UwPfzzArG7vm	\N
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
21	20230425113249_initial_setup.js	1	2023-05-02 13:01:20.977+05:30
26	20230502062146_update_user_table.js	2	2023-05-02 14:26:44.797+05:30
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, "userId", "createdAt", "totalPrice", "productDetails", location) FROM stdin;
1	1	2023-05-02 14:53:40.437+05:30	2500.00	{"{\\"price\\": 1000, \\"quantity\\": 2, \\"productId\\": 1}","{\\"price\\": 500, \\"quantity\\": 1, \\"productId\\": 2}"}	0101000020E61000003CDBA337DCC351C06D37C1374D374840
2	1	2023-05-02 14:56:46.359+05:30	3000.00	{"{\\"price\\": 1000, \\"quantity\\": 3, \\"productId\\": 1}"}	0101000020E61000003CDBA337DCC351C06D37C1374D374840
3	1	2023-05-02 16:42:58.5+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E61000003CDBA337DCC351C06D37C1374D374840
4	1	2023-05-04 13:30:04.196+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E61000003CDBA337DCC351C06D37C1374D374840
5	1	2023-05-04 15:53:39.095+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E6100000EF6C34257E4753402618737C59B73C40
6	1	2023-05-04 15:54:11.793+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E6100000EF6C34257E4753402618737C59B73C40
7	1	2023-05-04 16:00:30.438+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E6100000EF6C34257E475340000000000000F0BF
8	1	2023-05-04 16:07:43.862+05:30	3000.00	{"{\\"price\\": 1000, \\"quantity\\": 2, \\"productId\\": 1}"}	0101000020E6100000EF6C34257E4753402618737C59B73C40
9	1	2023-05-04 16:50:07.437715+05:30	4000.00	{"{\\"price\\": 1000, \\"quantity\\": 4, \\"productId\\": 1}"}	0101000020E6100000EF6C34257E4753402618737C59B73C40
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, name, description, price, quantity) FROM stdin;
1	Product 1	This is description	1000.00	100
2	Product 2	This is description	500.00	200
3	Product 3	This is description	5000.00	10
4	Product 4	This is description	750.00	80
5	Product 5	This is new description for 5	100.00	100
7	Product 7	This is description for 7	10.00	200
8	Product 8	This is description for 8	10.00	200
6	Product 9	This is description for 9	10.00	200
9	Product 9	This is description for 9	10.00	200
10	Product 10	This is description for 10	1000.00	200
11	Product 11	This is description for 11	150.00	200
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_id_seq', 15, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 26, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_id_seq', 9, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 11, true);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: customer_username_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customer_username_unique ON public.customer USING btree (username) WHERE ("deletedAt" IS NULL);


--
-- Name: order order_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_userid_foreign FOREIGN KEY ("userId") REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

