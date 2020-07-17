-- psql caper-petition -f  sql/profiles.sql

DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INTEGER,
    city VARCHAR,
    homepage VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);