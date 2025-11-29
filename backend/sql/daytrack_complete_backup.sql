--
-- PostgreSQL database dump
--

\restrict ehk6MQlSvZm8uUkc5cyPhxbzgiQOfwQJZjYB4ivjPJRcg3XwChoDHuuda1IAxwR

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-30 01:40:57

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

--
-- TOC entry 5007 (class 0 OID 16528)
-- Dependencies: 226
-- Data for Name: diary_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diary_entries (id, user_id, entry_date, emotion_id, sleep_id, text_entry, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5003 (class 0 OID 16502)
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
-- TOC entry 5011 (class 0 OID 16591)
-- Dependencies: 230
-- Data for Name: entry_hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entry_hashtags (id, entry_id, hashtag_id, created_at) FROM stdin;
\.


--
-- TOC entry 5009 (class 0 OID 16558)
-- Dependencies: 228
-- Data for Name: gallery_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_photos (id, entry_id, image_path, image_name, upload_order, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5012 (class 0 OID 24752)
-- Dependencies: 231
-- Data for Name: hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hashtags (id, tag_name, is_custom, created_at) FROM stdin;
1	любовь	f	2025-11-30 01:38:57.282973
2	работа	f	2025-11-30 01:38:57.282973
3	отдых	f	2025-11-30 01:38:57.282973
4	здоровье	f	2025-11-30 01:38:57.282973
5	друзья	f	2025-11-30 01:38:57.282973
6	семья	f	2025-11-30 01:38:57.282973
7	учеба	f	2025-11-30 01:38:57.282973
8	хобби	f	2025-11-30 01:38:57.282973
9	путешествие	f	2025-11-30 01:38:57.282973
10	мечты	f	2025-11-30 01:38:57.282973
\.


--
-- TOC entry 5005 (class 0 OID 16514)
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
-- TOC entry 5001 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, login, password_hash, birth_date, gender, created_at) FROM stdin;
\.


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 225
-- Name: diary_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diary_entries_id_seq', 1, true);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 221
-- Name: emotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emotions_id_seq', 6, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 229
-- Name: entry_hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entry_hashtags_id_seq', 1, false);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 227
-- Name: gallery_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_photos_id_seq', 1, false);


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 232
-- Name: hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hashtags_id_seq', 10, true);


--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 223
-- Name: sleep_quality_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sleep_quality_id_seq', 6, true);


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


-- Completed on 2025-11-30 01:40:58

--
-- PostgreSQL database dump complete
--

\unrestrict ehk6MQlSvZm8uUkc5cyPhxbzgiQOfwQJZjYB4ivjPJRcg3XwChoDHuuda1IAxwR