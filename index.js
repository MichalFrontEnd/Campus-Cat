const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("./public"));
//app.use(express.static("./"));

app.use(express.urlencoded({ extended: false }));

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const db = require("./db");

let signers;
let first;
let last;

app.get("/", (req, res) => {
    console.log("let's see...");
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
    db.getSignatures()
        .then((results) => {
            //console.log("getSignature results: ", results);
        })
        .catch((err) => {
            console.log("err in GET /petition: ", err);
        });
});

app.post("/petition", (req, res) => {
    //console.log("info: ", req.body);
    db.addSignatures(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            // any code I write here will run after addCity has run
            console.log("hi");
        })
        .catch((err) => {
            console.log("err in POST /petition: ", err);
        });
    res.redirect("/thankyou");
});

app.get("/thankyou", (req, res) => {
    db.sigNumber()
        .then((results) => {
            //console.log("results: ", results.rows[0].id);
            signers = results.rows[0].id;
            res.render("thankyou", {
                layout: "main",
                signatures: `check out all ${signers} signatures!`,
            });
        })
        .catch((err) => {
            console.log("err in GET /thankyou: ", err);
        });
});

app.get("/signers", (req, res) => {
    let names = [];
    db.getNames()
        .then((results) => {
            //console.log("signers object :", results);
            for (let i = 0; i < results.rows.length; i++) {
                //        //console.log("first: ", results.rows[0].first);
                //        //console.log("last: ", results.rows[0].last);

                first = results.rows[i].first;
                last = results.rows[i].last;
                names.push(`${first}    ${last}`);
                //console.log("names: ", names);
                //console.log("first: ", first);
                //console.log("last: ", last);
            }
            res.render("signers", {
                layout: "main",
                names,
            });
        })
        .catch((err) => {
            console.log("err in GET /signers: ", err);
        });
});

app.listen(8080, () => console.log("petition server is listening..."));
