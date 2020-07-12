const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/caper-petition");

// -- THIS IS A QUERY BEING WRITTEN FOR DEMO PURPOSES
module.exports.getSignatures = function () {
    let q = "SELECT * FROM signatures";
    return db.query(q);
};

// this is an alternative way of doing the same exact query!
// module.exports.getCities = function () {
// 	return db.query("SELECT * FROM cities");
// };

module.exports.addSignatures = (first, last, signature) => {
    let q =
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)";
    // "params" is something you ONLY have to do IF the query takes arguments
    let params = [first, last, signature];
    return db.query(q, params);
};

// module.exports.addCity = (city, country) => {
// 	return db.query("INSERT INTO cities (city, country) VALUES ($1, $2)", [
// 		city,
// 		country,
// 	]);
// };
