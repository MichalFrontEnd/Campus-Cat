-- psql caper-petition -f  sql/users.sql

DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL CHECK(first !=''),
    last VARCHAR(255) NOT NULL CHECK(last !=''),
    email VARCHAR(255) NOT NULL UNIQUE,
    pwd VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);