const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
//("puserPw", "hashedPw").then((matchValueCompare) => {
//    console.log("do plaintext and hashedpw match?", matchValueCompare);
//});;
module.exports.hash = (plainTxPw) =>
    genSalt().then((salt) => hash(plainTxPw, salt));

//genSalt()
//    .then((salt) => {
//        console.log("salt: ", salt);
//        return hash("plainTxtPw", salt);
//    })
//    .then((hashedPw) => {
//        console.log("hashedPw: ", hashedPw);
//        return compare("plainTxtPw", hashedPw);
//    })
//    .then((matchValueCompare) => {
//        console.log("do plaintext and pw match?", matchValueCompare);
//    });