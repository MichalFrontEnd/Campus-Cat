const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const hb = require("express-handlebars");
const db = require("./db");

//const { body, validationResult, sanitizeBody } = require("express-validator");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(
    cookieSession({
        secret: `Cats are the best.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("./public"));
//app.use(express.static("./"));

app.use(express.urlencoded({ extended: false }));


let signers;
let first;
let last;
let email;
let userPwd;
let user_id;


app.get("/", (req, res) => {
    res.redirect("/reg");
});



app.get("/reg", (req, res) => {
    //if users have a signature or a user_id stored they are redirected to see their signature. Maybe can get rid.
    if (req.session.hasSigId === true || req.session.hasUserId === true) {
        res.redirect("/thankyou");
    } else {
        res.render("reg", {
            layout: "main",
        });
        //gets info from the users db
        db.getCreds()
            .then((results) => {
                //console.log("getCreds results: ", results);
            })
            .catch((err) => {
                console.log("err in GET /reg getting creds: ", err);
            });
    }
});


app.post("/reg", (req, res) => {
    //console.log('req.body: ', req.body);
    first = req.body.first;
    last = req.body.last;
    email = req.body.email;
    userPwd = req.body.pwd;


    hash(userPwd).then((hashedPwd) => {
        //console.log('hashed user Pwd: ', hashedPwd);
        db.logCreds(first, last, email, hashedPwd).then((results) => {
            //console.log('logCred results: ', results);

            //storing the user_id and name in the cookie:
            req.session.user_id = results.rows[0].id;
            req.session.hasUserId = true;
            req.session.first = first;
            req.session.last = last;

            res.redirect("/newprofile");

        }).catch((err) => {
            console.log("err in logCreds in POST /reg: ", err);
            res.render("reg", {
                layout: "main",
                error: true,
            });
        })

    }).catch((err) => {
        console.log("err in password hashing: ", err);
        res.render("reg", {
            layout: "main",
            error: true,
        });
    });
});

app.get("/newprofile", (req, res) => {
    res.render("newprofile", {
        layout: "main",
    })
})

app.post("/newprofile", (req, res) => {

})

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
    //getting the credentials from the db Do I need this?
    db.getCreds()
        .then((results) => {
            //console.log("getCreds results: ", results);
        })
        .catch((err) => {
            console.log("err in GET /login getting creds: ", err);
        });
});

app.post("/login", (req, res) => {
    //getting the hashed pwd from the db using the email.
    if (req.body.email) {
        db.getPwd(req.body.email).then((results) => {
            //console.log('results from getPwd: ', results);
            if (!results.rows[0].pwd) {
                res.render("login", {
                    layout: "main",
                    error: true,
                })
            } else {
                //comparing the user input pwd and the hashed pwd
                compare(req.body.pwd, results.rows[0].pwd).then((matchValue) => {
                    //console.log('matchValue: ', matchValue);
                    if (matchValue === true) {
                        req.session.hasUserId = true;
                        req.session.email = req.body.email;
                        req.session.user_id = results.rows[0].id
                        req.session.loggedIn = true;
                        //console.log('req.session after login credcomparison: ', req.session);
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    }
                }).catch((err) => {
                    console.log("error in compare");
                });
            }

        }).catch((err) => {
            console.log("err in Post /login getting creds: ", err);
            res.render("login", {
                layout: "main",
                error: true,
            });
        });

        //console.log('req.body in post/login: ', req.body);
    } else {
        res.render("login", {
            layout: "main",
            error: true,
        });
    }
});

//a middleware to redirect user. Doesn't seem to work.
//app.use(function redirect(req, res, next) {
//    if (!req.session.hasUserId) {
//        res.redirect("/register");
//        //    } else if (req.session.hasUserId) {
//        //        if (req.session.loggedIn) {
//        //            if (req.session.hasSigId) {
//        //                res.redirect("/thankyou");
//        //            } else {
//        //                res.redirect("/petition");
//        //            }
//        //        } else {
//        //            res.redirect("/login")
//        //        }
//    } else {
//        next();
//    }
//});

app.get("/petition", (req, res) => {
    //checks cookies if signed petition
    if (req.session.hasSigId) {
        res.redirect("/thankyou");
        //} else if (req.session.hasUserId === "user_id") {
        //    res.redirect("/login");
    } else {
        res.render("petition", {
            layout: "main",
        });
        //selects all info from signature db
        db.getSignatures()
            .then((results) => {
                //console.log("getSignature results: ", results);
            })
            .catch((err) => {
                console.log("err in GET /petition: ", err);
            });
    }
});

app.post("/petition", (req, res) => {

    db.addSignatures(req.session.user_id, req.body.signature)
        .then((results) => {
            //console.log('req.body in addSignature: ', req.body);
            //console.log('req.session.user_id: ', req.session.user_id);
            //console.log('req.body.signature: ', req.body.signature);
            console.log('results in addSignature: ', results);

            //storing the signature id in the cookie
            req.session.hasSigId = true;
            req.session.sigId = results.rows[0].id
            res.redirect("/thankyou");
            console.log('req.session after addSignatures: ', req.session);
        })
        .catch((err) => {
            console.log("err in POST /petition: ", err);
            res.render("petition", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/thankyou", (req, res) => {

    db.sigNumber()
        .then((results) => {
            //console.log("results from sigNumber: ", results);
            if (req.session.hasSigId) {
                signers = results.rows[0].count;
                db.getSigUrl(req.session.user_id).then((results) => {
                    console.log('results in getSigUrl: ', results);
                    res.render("thankyou", {
                        layout: "main",
                        thanks: `Thank you ${req.session.first}, for signing the petition!`,
                        signatures: `check out all ${signers} signatures!`,
                        //dataUrl: `${results.rows[0].signature}`,
                    })
                }).catch((err) => {
                    console.log("err in GET /thankyou getSigUrl: ", err);
                })
            } else {
                res.redirect("/petition");
            }


        }).catch((err) => {
            console.log("err in GET /thankyou get sigNumber: ", err);;
        });
});

app.get("/signers", (req, res) => {
    let names = [];
    db.getNames()
        .then((results) => {
            //console.log("signers object :", results);
            for (let i = 0; i < results.rows.length; i++) {
                //console.log("first: ", results.rows[0].first);
                //console.log("last: ", results.rows[0].last);

                first = results.rows[i].first;
                last = results.rows[i].last;
                names.push(`${first}       ${last}`);
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

//if unning on Heroku liten on Heroku port(environment), otherwise, listen locally
app.listen(process.env.PORT || 8080, () => console.log("petition server is listening..."));