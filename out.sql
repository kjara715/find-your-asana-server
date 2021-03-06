PGDMP     9                    y           yogadb    13.3    13.3     ?           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            ?           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            ?           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            ?           1262    70494    yogadb    DATABASE     j   CREATE DATABASE yogadb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';
    DROP DATABASE yogadb;
                postgres    false            ?            1259    70509    posts    TABLE     ?   CREATE TABLE public.posts (
    id integer NOT NULL,
    caption character varying(120) NOT NULL,
    media text,
    username character varying(25) NOT NULL,
    pin text,
    pin_id integer
);
    DROP TABLE public.posts;
       public         heap    postgres    false            ?            1259    70507    posts_id_seq    SEQUENCE     ?   CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.posts_id_seq;
       public          postgres    false    202            ?           0    0    posts_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;
          public          postgres    false    201            ?            1259    70495    users    TABLE       CREATE TABLE public.users (
    username character varying(25) NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    bio character varying(250) DEFAULT NULL::character varying,
    profile_img text DEFAULT 'https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'::text,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_check CHECK (("position"(email, '@'::text) > 1))
);
    DROP TABLE public.users;
       public         heap    postgres    false            ,           2604    70512    posts id    DEFAULT     d   ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);
 7   ALTER TABLE public.posts ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    201    202    202            ?          0    70509    posts 
   TABLE DATA           J   COPY public.posts (id, caption, media, username, pin, pin_id) FROM stdin;
    public          postgres    false    202   ?       ?          0    70495    users 
   TABLE DATA           m   COPY public.users (username, password, first_name, last_name, email, bio, profile_img, is_admin) FROM stdin;
    public          postgres    false    200   ?       ?           0    0    posts_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.posts_id_seq', 1, false);
          public          postgres    false    201            0           2606    70517    posts posts_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_pkey;
       public            postgres    false    202            .           2606    70506    users users_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    200            1           2606    70518    posts posts_username_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_username_fkey;
       public          postgres    false    2862    200    202            ?      x?????? ? ?      ?      x?????? ? ?     