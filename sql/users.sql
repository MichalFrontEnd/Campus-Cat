DROP TABLE IF EXISTS users;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK(first !=''),
    last VARCHAR NOT NULL CHECK(last !=''),
    email VARCHAR NOT NULL CHECK(email !='') UNIQE,
    pwd VARCHAR NOT NULL CHECK(email !=''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);