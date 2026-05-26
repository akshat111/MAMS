--
-- PostgreSQL database dump
--

\restrict MLCl7Sxb6f3UyjZxnhNoshZziO0d7jBIryHlqh5NqpCYtwZqbBvVbmXwgjpefQU

-- Dumped from database version 18.4 (3ef8dfc)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    equipment_id integer,
    personnel_name character varying(100) NOT NULL,
    base_id integer NOT NULL,
    quantity integer NOT NULL,
    assigned_date date DEFAULT CURRENT_DATE NOT NULL,
    assigned_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assignments OWNER TO neondb_owner;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO neondb_owner;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    base_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment OWNER TO neondb_owner;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO neondb_owner;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: expenditures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expenditures (
    id integer NOT NULL,
    equipment_id integer,
    base_id integer NOT NULL,
    quantity integer NOT NULL,
    reason text NOT NULL,
    expended_date date DEFAULT CURRENT_DATE NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenditures OWNER TO neondb_owner;

--
-- Name: expenditures_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.expenditures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenditures_id_seq OWNER TO neondb_owner;

--
-- Name: expenditures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.expenditures_id_seq OWNED BY public.expenditures.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs OWNER TO neondb_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_id_seq OWNER TO neondb_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    equipment_id integer,
    base_id integer NOT NULL,
    quantity integer NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchases OWNER TO neondb_owner;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO neondb_owner;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: transfers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transfers (
    id integer NOT NULL,
    equipment_id integer,
    from_base_id integer NOT NULL,
    to_base_id integer NOT NULL,
    quantity integer NOT NULL,
    transfer_date date DEFAULT CURRENT_DATE NOT NULL,
    transferred_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transfers OWNER TO neondb_owner;

--
-- Name: transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transfers_id_seq OWNER TO neondb_owner;

--
-- Name: transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.transfers_id_seq OWNED BY public.transfers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    base_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'LogisticsOfficer'::character varying, 'BaseCommander'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: expenditures id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenditures ALTER COLUMN id SET DEFAULT nextval('public.expenditures_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: transfers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transfers ALTER COLUMN id SET DEFAULT nextval('public.transfers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assignments (id, equipment_id, personnel_name, base_id, quantity, assigned_date, assigned_by, created_at) FROM stdin;
1	1	Captain Nitin	1	3	2026-05-10	1	2026-05-25 05:43:38.275907
2	3	captain sharma	2	3	2026-05-05	3	2026-05-25 14:24:45.821858
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.equipment (id, name, type, quantity, base_id, created_at) FROM stdin;
4	Jeep	Vehicle	2	3	2026-05-23 11:42:53.63454
2	AKM	Assault Rifle	15	2	2026-05-23 11:42:10.556864
5	Jeep	Vehicle	2	1	2026-05-23 11:43:34.576318
6	M416	Assualt Rifle	2	3	2026-05-25 14:23:30.956678
1	M416	Assualt Rifle	12	1	2026-05-23 11:41:50.660748
7	M416	Assualt Rifle	3	2	2026-05-25 14:23:58.24031
3	Hand Grenade	Toss Weapon	47	2	2026-05-23 11:42:30.915934
\.


--
-- Data for Name: expenditures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenditures (id, equipment_id, base_id, quantity, reason, expended_date, created_by, created_at) FROM stdin;
1	2	2	5	Combat damage	2026-05-05	1	2026-05-25 05:43:04.671607
2	2	2	5	Combat damage	2026-05-05	1	2026-05-25 05:43:06.879793
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.logs (id, user_id, action, "timestamp") FROM stdin;
1	1	Added equipment: M416 (Qty: 20, Base ID: 1)	2026-05-23 11:41:50.898267
2	1	Added equipment: AKM (Qty: 25, Base ID: 2)	2026-05-23 11:42:10.782163
3	1	Added equipment: Hand Grenade (Qty: 50, Base ID: 2)	2026-05-23 11:42:31.146258
4	1	Added equipment: Jeep (Qty: 3, Base ID: 3)	2026-05-23 11:42:53.859951
5	1	Transferred 1 units of Jeep (ID: 4) from base 3 to base 1	2026-05-23 11:43:35.938947
6	1	Expended 5 units of AKM at base ID 2 due to: Combat damage	2026-05-25 05:43:05.597788
7	1	Expended 5 units of AKM at base ID 2 due to: Combat damage	2026-05-25 05:43:07.747614
8	1	Assigned 3 units of M416 to Captain Nitin at base ID 1	2026-05-25 05:43:39.164275
9	1	Purchased 1 units of equipment ID 5 for base ID 1	2026-05-25 05:44:01.882478
10	3	Transferred 2 units of M416 (ID: 1) from base 1 to base 3	2026-05-25 14:23:32.30814
11	3	Transferred 3 units of M416 (ID: 1) from base 1 to base 2	2026-05-25 14:23:59.60053
12	3	Assigned 3 units of Hand Grenade to captain sharma at base ID 2	2026-05-25 14:24:46.655361
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchases (id, equipment_id, base_id, quantity, purchase_date, created_by, created_at) FROM stdin;
1	5	1	1	2026-05-18	1	2026-05-25 05:44:00.987834
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transfers (id, equipment_id, from_base_id, to_base_id, quantity, transfer_date, transferred_by, created_at) FROM stdin;
1	4	3	1	1	2026-05-22	1	2026-05-23 11:43:34.576318
2	1	1	3	2	2026-04-08	3	2026-05-25 14:23:30.956678
3	1	1	2	3	2026-02-09	3	2026-05-25 14:23:58.24031
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, password, role, base_id, created_at) FROM stdin;
1	Akshat	Admin@mams.com	$2b$10$xPSo7BQioiQ3JLE5Zp0T0./1zgHc8vQn7TdAKDxUZw4PXskkRhblW	Admin	\N	2026-05-23 11:40:07.061446
2	Akshat	Akshat@mams.com	$2b$10$Ju8V3BQSingpxIIFmakyN.aP8UlQHe8DrsQKhr5OjtSlOhuucH.gq	Admin	\N	2026-05-23 11:54:59.550963
3	Officer Vijay	officer1@mams.com	$2b$10$jZntVBzXD2Ky9bhYck.4NOsVX6efy/.61DV1metMiHHgI5EOX0od2	LogisticsOfficer	\N	2026-05-25 14:00:41.020525
4	commander abhinandan	commander1@mams.com	$2b$10$S.4Rloc/AxfsS/7S5cjZDuWH15.eVtSIyNqEUKp.KjMURmQLp7EZW	BaseCommander	1	2026-05-25 14:02:02.320143
\.


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.assignments_id_seq', 2, true);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.equipment_id_seq', 7, true);


--
-- Name: expenditures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expenditures_id_seq', 2, true);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.logs_id_seq', 12, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, true);


--
-- Name: transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.transfers_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: expenditures expenditures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assignments assignments_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: expenditures expenditures_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: expenditures expenditures_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: logs logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchases purchases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchases purchases_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: transfers transfers_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: transfers transfers_transferred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_transferred_by_fkey FOREIGN KEY (transferred_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict MLCl7Sxb6f3UyjZxnhNoshZziO0d7jBIryHlqh5NqpCYtwZqbBvVbmXwgjpefQU

