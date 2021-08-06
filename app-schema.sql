

DROP DATABASE IF EXISTS yogadb;
CREATE DATABASE yogadb;
\connect yogadb;

-- \i jobly-schema.sql
-- \i jobly-seed.sql


-- \echo 'Delete and recreate jobly_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE jobly_test;
-- CREATE DATABASE jobly_test;
-- \connect jobly_test

-- \i jobly-schema.sql


CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
      CHECK (position('@' IN email) > 1),
    bio VARCHAR(250) DEFAULT NULL,
    profile_img TEXT DEFAULT 'https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
    
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    caption VARCHAR(120) NOT NULL,
    media TEXT,
    username VARCHAR(25) NOT NULL
        REFERENCES users ON DELETE CASCADE,
    pin TEXT,
    pin_id INT        
);


INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'blah@blah.com',
        FALSE);

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES  ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'admin@admin.com',
        TRUE);





