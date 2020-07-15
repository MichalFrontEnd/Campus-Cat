const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/caper-petition");


module.exports.getSignatures = function() {
    let q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.getCreds = function() {
    let q = "SELECT * FROM users";
    return db.query(q);
};

module.exports.logCreds = (first, last, email, pwd) => {
    let q = "INSERT INTO users (first, last, email, pwd) VALUES ($1, $2, $3, $4)RETURNING id";

    let params = [first, last, email, pwd];
    console.log("params:", params);
    return db.query(q, params);
};

module.exports.getPwd = function(email) {
    let q = "SELECT pwd, id FROM users WHERE email = $1";
    let params = [email];
    return db.query(q, params);
};

// this is an alternative way of doing the same exact query!
// module.exports.getCities = function () {
// 	return db.query("SELECT * FROM cities");
// };

module.exports.addSignatures = (user_id, signature) => {
    let q =
        "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id";
    let params = [user_id, signature];
    return db.query(q, params);
};

module.exports.sigNumber = (id) => {
    let q = "SELECT * FROM signatures ORDER BY id DESC LIMIT 1";
    //let q = "SELECT COUNT(*) FROM signatures";
    //let q = "SELECT MAX(id) FROM signatures";
    let param = id;
    //console.log("params: ", param);
    //console.log("q: ", q);
    return db.query(q, param);
};

module.exports.getSigUrl = (id) => {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = id;
    return db.query(q, params);
}

module.exports.getNames = () => {
    let q = "SELECT first, last FROM users";
    // "params" is something you ONLY have to do IF the query takes arguments
    //console.log("q: ", q);
    return db.query(q);
};