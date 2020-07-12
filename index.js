const express = require("express");
const app = express();

app.use(express.static("./public"));
//app.use(express.static("./"));

app.use(express.urlencoded({ extended: false }));

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const db = require("./db");

let signers;

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
    db.getSignatures()
        .then((results) => {
            //console.log("results: ", results);
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
            //console.log("hi");
        })
        .catch((err) => {
            console.log("err in POST /add-signature: ", err);
        });
    res.redirect("/thankyou");
});

app.get("/thankyou", (req, res) => {
    db.sigNumber().then((results) => {
        console.log("results: ", results.rows[0].id);
        signers = results.rows[0].id;
    });
    res.render("thankyou", {
        layout: "main",
        signatures: `check out all ${signers} signatures!`,
    });
});

//app.use(
//    (req, res, next) => {
//        if (req.cookies.accepted || req.url == '/cookie') {
//            return next();
//        }
//        if (!req.cookies.url) {
//            res.cookie('url', req.url);
//        }
//        res.redirect('/cookie');
//    }
//);

app.listen(8080, () => console.log("petition server is listening..."));
