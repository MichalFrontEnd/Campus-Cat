  
-- psql caper-petition -f  sql/signatures.sql

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    --first VARCHAR NOT NULL CHECK(first !=''),
    --last VARCHAR NOT NULL CHECK(last !=''),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature TEXT NOT NULL CHECK(signature !=''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);