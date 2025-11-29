--
-- PostgreSQL database dump
--

\restrict e8l4ez8rf6gmdGcYCb4xhjdwjgfcSFovnZhoFnDBhkX046r4z0zdyVtKjsOP8cq

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-29 23:15:58

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
-- TOC entry 226 (class 1259 OID 16528)
-- Name: diary_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diary_entries (
    id integer NOT NULL,
    user_id integer NOT NULL,
    entry_date date NOT NULL,
    emotion_id integer,
    sleep_id integer,
    text_entry text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.diary_entries OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16527)
-- Name: diary_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diary_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diary_entries_id_seq OWNER TO postgres;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 225
-- Name: diary_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diary_entries_id_seq OWNED BY public.diary_entries.id;


--
-- TOC entry 222 (class 1259 OID 16502)
-- Name: emotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emotions (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_order integer DEFAULT 0,
    image_url character varying(500) DEFAULT '/images/default-emotion.png'::character varying NOT NULL
);


ALTER TABLE public.emotions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16501)
-- Name: emotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emotions_id_seq OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 221
-- Name: emotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emotions_id_seq OWNED BY public.emotions.id;


--
-- TOC entry 232 (class 1259 OID 16591)
-- Name: entry_hashtags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entry_hashtags (
    id integer NOT NULL,
    entry_id integer NOT NULL,
    hashtag_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.entry_hashtags OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16590)
-- Name: entry_hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entry_hashtags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entry_hashtags_id_seq OWNER TO postgres;

--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 231
-- Name: entry_hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entry_hashtags_id_seq OWNED BY public.entry_hashtags.id;


--
-- TOC entry 228 (class 1259 OID 16558)
-- Name: gallery_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery_photos (
    id integer NOT NULL,
    entry_id integer NOT NULL,
    image_path character varying(500) NOT NULL,
    image_name character varying(255),
    upload_order integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gallery_photos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16557)
-- Name: gallery_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gallery_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gallery_photos_id_seq OWNER TO postgres;

--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 227
-- Name: gallery_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gallery_photos_id_seq OWNED BY public.gallery_photos.id;


--
-- TOC entry 230 (class 1259 OID 16575)
-- Name: hashtags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hashtags (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tag_name character varying(50) NOT NULL,
    color character varying(7) DEFAULT '#000000'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hashtags OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16574)
-- Name: hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hashtags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hashtags_id_seq OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 229
-- Name: hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hashtags_id_seq OWNED BY public.hashtags.id;


--
-- TOC entry 224 (class 1259 OID 16514)
-- Name: sleep_quality; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sleep_quality (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_order integer DEFAULT 0,
    image_url character varying(500) DEFAULT '/images/default-sleep.png'::character varying NOT NULL
);


ALTER TABLE public.sleep_quality OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16513)
-- Name: sleep_quality_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sleep_quality_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sleep_quality_id_seq OWNER TO postgres;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 223
-- Name: sleep_quality_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sleep_quality_id_seq OWNED BY public.sleep_quality.id;


--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    login character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    birth_date date NOT NULL,
    gender character(1),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_gender_check CHECK ((gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4793 (class 2604 OID 16531)
-- Name: diary_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries ALTER COLUMN id SET DEFAULT nextval('public.diary_entries_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 16505)
-- Name: emotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions ALTER COLUMN id SET DEFAULT nextval('public.emotions_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16594)
-- Name: entry_hashtags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags ALTER COLUMN id SET DEFAULT nextval('public.entry_hashtags_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 16561)
-- Name: gallery_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_photos ALTER COLUMN id SET DEFAULT nextval('public.gallery_photos_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16578)
-- Name: hashtags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags ALTER COLUMN id SET DEFAULT nextval('public.hashtags_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 16517)
-- Name: sleep_quality id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_quality ALTER COLUMN id SET DEFAULT nextval('public.sleep_quality_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 16392)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5003 (class 0 OID 16528)
-- Dependencies: 226
-- Data for Name: diary_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diary_entries (id, user_id, entry_date, emotion_id, sleep_id, text_entry, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4999 (class 0 OID 16502)
-- Dependencies: 222
-- Data for Name: emotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emotions (id, name, display_order, image_url) FROM stdin;
1	Грустный	1	/images/emotions/sad.png
2	Нейтральный	2	/images/emotions/neutral.png
3	Спокойный	3	/images/emotions/calm.png
4	Радостный	4	/images/emotions/happy.png
5	Счастлив	5	/images/emotions/joyful.png
\.


--
-- TOC entry 5009 (class 0 OID 16591)
-- Dependencies: 232
-- Data for Name: entry_hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entry_hashtags (id, entry_id, hashtag_id, created_at) FROM stdin;
\.


--
-- TOC entry 5005 (class 0 OID 16558)
-- Dependencies: 228
-- Data for Name: gallery_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_photos (id, entry_id, image_path, image_name, upload_order, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5007 (class 0 OID 16575)
-- Dependencies: 230
-- Data for Name: hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hashtags (id, user_id, tag_name, color, created_at) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 16514)
-- Dependencies: 224
-- Data for Name: sleep_quality; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sleep_quality (id, name, display_order, image_url) FROM stdin;
1	Отлично поспал	1	/images/sleep/excellent.png
2	Хорошо поспал	2	/images/sleep/good.png
3	Нормально	3	/images/sleep/average.png
4	Плохо спал	4	/images/sleep/bad.png
5	бессоница	5	/images/sleep/terrible.png
\.


--
-- TOC entry 4997 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, login, password_hash, birth_date, gender, created_at) FROM stdin;
\.


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 225
-- Name: diary_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diary_entries_id_seq', 1, true);


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 221
-- Name: emotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emotions_id_seq', 6, true);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 231
-- Name: entry_hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entry_hashtags_id_seq', 1, false);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 227
-- Name: gallery_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_photos_id_seq', 1, false);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 229
-- Name: hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hashtags_id_seq', 1, false);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 223
-- Name: sleep_quality_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sleep_quality_id_seq', 6, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4827 (class 2606 OID 16539)
-- Name: diary_entries diary_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT diary_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 16541)
-- Name: diary_entries diary_entries_user_id_entry_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT diary_entries_user_id_entry_date_key UNIQUE (user_id, entry_date);


--
-- TOC entry 4815 (class 2606 OID 16512)
-- Name: emotions emotions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions
    ADD CONSTRAINT emotions_name_key UNIQUE (name);


--
-- TOC entry 4817 (class 2606 OID 24720)
-- Name: emotions emotions_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions
    ADD CONSTRAINT emotions_name_unique UNIQUE (name);


--
-- TOC entry 4819 (class 2606 OID 16510)
-- Name: emotions emotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions
    ADD CONSTRAINT emotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 16598)
-- Name: entry_hashtags entry_hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags
    ADD CONSTRAINT entry_hashtags_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 16568)
-- Name: gallery_photos gallery_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_photos
    ADD CONSTRAINT gallery_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16584)
-- Name: hashtags hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 16524)
-- Name: sleep_quality sleep_quality_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_quality
    ADD CONSTRAINT sleep_quality_name_key UNIQUE (name);


--
-- TOC entry 4823 (class 2606 OID 24724)
-- Name: sleep_quality sleep_quality_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_quality
    ADD CONSTRAINT sleep_quality_name_unique UNIQUE (name);


--
-- TOC entry 4825 (class 2606 OID 16522)
-- Name: sleep_quality sleep_quality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_quality
    ADD CONSTRAINT sleep_quality_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 16405)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4807 (class 2606 OID 24686)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4809 (class 2606 OID 24689)
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- TOC entry 4811 (class 2606 OID 24691)
-- Name: users users_login_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_unique UNIQUE (login);


--
-- TOC entry 4813 (class 2606 OID 16403)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 16547)
-- Name: diary_entries diary_entries_emotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT diary_entries_emotion_id_fkey FOREIGN KEY (emotion_id) REFERENCES public.emotions(id);


--
-- TOC entry 4837 (class 2606 OID 16552)
-- Name: diary_entries diary_entries_sleep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT diary_entries_sleep_id_fkey FOREIGN KEY (sleep_id) REFERENCES public.sleep_quality(id);


--
-- TOC entry 4838 (class 2606 OID 16542)
-- Name: diary_entries diary_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT diary_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4845 (class 2606 OID 16599)
-- Name: entry_hashtags entry_hashtags_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags
    ADD CONSTRAINT entry_hashtags_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;


--
-- TOC entry 4846 (class 2606 OID 16604)
-- Name: entry_hashtags entry_hashtags_hashtag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags
    ADD CONSTRAINT entry_hashtags_hashtag_id_fkey FOREIGN KEY (hashtag_id) REFERENCES public.hashtags(id) ON DELETE CASCADE;


--
-- TOC entry 4839 (class 2606 OID 24709)
-- Name: diary_entries fk_diary_entries_emotion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT fk_diary_entries_emotion FOREIGN KEY (emotion_id) REFERENCES public.emotions(id);


--
-- TOC entry 4840 (class 2606 OID 24714)
-- Name: diary_entries fk_diary_entries_sleep; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT fk_diary_entries_sleep FOREIGN KEY (sleep_id) REFERENCES public.sleep_quality(id);


--
-- TOC entry 4841 (class 2606 OID 24704)
-- Name: diary_entries fk_diary_entries_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diary_entries
    ADD CONSTRAINT fk_diary_entries_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4847 (class 2606 OID 24736)
-- Name: entry_hashtags fk_entry_hashtags_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags
    ADD CONSTRAINT fk_entry_hashtags_entry FOREIGN KEY (entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;


--
-- TOC entry 4848 (class 2606 OID 24741)
-- Name: entry_hashtags fk_entry_hashtags_hashtag; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_hashtags
    ADD CONSTRAINT fk_entry_hashtags_hashtag FOREIGN KEY (hashtag_id) REFERENCES public.hashtags(id) ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 24728)
-- Name: hashtags fk_hashtags_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT fk_hashtags_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4842 (class 2606 OID 16569)
-- Name: gallery_photos gallery_photos_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_photos
    ADD CONSTRAINT gallery_photos_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;


--
-- TOC entry 4844 (class 2606 OID 16585)
-- Name: hashtags hashtags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-11-29 23:15:58

--
-- PostgreSQL database dump complete
--

\unrestrict e8l4ez8rf6gmdGcYCb4xhjdwjgfcSFovnZhoFnDBhkX046r4z0zdyVtKjsOP8cq

