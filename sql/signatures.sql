  
-- psql caper-petition -f  sql/signatures.sql
--
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL CHECK(first !=''),
    last VARCHAR(255) NOT NULL CHECK(last !=''),
    email VARCHAR(255) NOT NULL UNIQUE,
    pwd VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS signatures CASCADE;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    --first VARCHAR NOT NULL CHECK(first !=''),
    --last VARCHAR NOT NULL CHECK(last !=''),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INT,
    city VARCHAR,
    homepage VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

