const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/caper-petition");

module.exports.getSignatures = function () {
    let q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.getCreds = function () {
    let q = "SELECT * FROM users";
    return db.query(q);
};

module.exports.logCreds = (first, last, email, pwd) => {
    let q = "INSERT INTO users (first, last, email, pwd) VALUES ($1, $2, $3, $4)RETURNING id";

    let params = [first, last, email, pwd];
    return db.query(q, params);
};

module.exports.logProfiles = (age, city, homepage, user_id) => {
    let q = "INSERT INTO profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4)";

    let params = [+age || null, city || null, homepage || null, user_id];
    return db.query(q, params);
};

module.exports.getPwd = function (email) {
    let q = "SELECT users.first, users.pwd, users.id, signatures.id AS sigid FROM users JOIN signatures ON users.id = signatures.user_id WHERE users.email = $1";

    let params = [email];

    return db.query(q, params);
};

module.exports.addSignatures = (user_id, signature) => {
    let q = "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id";
    let params = [user_id, signature];
    return db.query(q, params);
};

module.exports.sigNumber = () => {
    let q = "SELECT COUNT(*) FROM signatures";
    return db.query(q);
};

module.exports.getSigUrl = (id) => {
    let q = "SELECT signature FROM signatures WHERE user_id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.getNames = () => {
    let q = "SELECT first, last, age, city, homepage FROM users RIGHT JOIN signatures ON users.id=signatures.user_id LEFT JOIN profiles ON users.id = profiles.user_id";
    return db.query(q);
};

module.exports.getInfo = (id) => {
    let q = "SELECT first, last, email, pwd, age, city, homepage FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE users.id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.upsertInfo = (id, age, city, homepage) => {
    let q = "INSERT INTO profiles (user_id, age, city, homepage) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $2, city = $3, homepage = $4 ";
    let params = [id, +age, city, homepage];

    return db.query(q, params);
};

module.exports.updatePassword = (id, pwd) => {
    let q = "UPDATE users SET pwd = $2 WHERE id = $1";
    let params = [id, pwd];
    return db.query(q, params);
};

module.exports.updateInfo = (id, first, last, email) => {
    let q = "UPDATE users SET first = $2, last = $3, email = $4 WHERE id = $1";
    let params = [id, first, last, email];
    return db.query(q, params);
};

module.exports.getCity = (city) => {
    let q = "SELECT first, last, age, city, homepage FROM users RIGHT JOIN signatures ON users.id=signatures.user_id LEFT JOIN profiles ON users.id = profiles.user_id WHERE LOWER(city) = LOWER($1)";
    let params = [city];
    return db.query(q, params);
};

module.exports.deleteSig = (id) => {
    let q = "DELETE FROM signatures WHERE user_id = $1;";
    let params = [id];
    return db.query(q, params);
};
