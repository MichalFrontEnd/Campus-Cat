
DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    --first VARCHAR NOT NULL CHECK(first !=''),
    --last VARCHAR NOT NULL CHECK(last !=''),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INTEGER,
    city VARCHAR,
    homepage VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);