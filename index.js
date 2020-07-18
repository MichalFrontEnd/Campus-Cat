const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const hb = require("express-handlebars");
const db = require("./db");
const { requireLoggedOutUser, requireNoSignature } = require("./middleware");

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

app.get("/reg", requireLoggedOutUser, (req, res) => {
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

    hash(userPwd)
        .then((hashedPwd) => {
            //console.log('hashed user Pwd: ', hashedPwd);
            db.logCreds(first, last, email, hashedPwd)
                .then((results) => {
                    //console.log('logCred results: ', results);

                    //storing the user_id and name in the cookie:
                    req.session.user_id = results.rows[0].id;
                    req.session.hasUserId = true;
                    req.session.first = first;
                    req.session.last = last;

                    res.redirect("/newprofile");
                })
                .catch((err) => {
                    console.log("err in logCreds in POST /reg: ", err);
                    res.render("reg", {
                        layout: "main",
                        error: true,
                    });
                });
        })
        .catch((err) => {
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
    });
});

app.post("/newprofile", (req, res) => {
    //console.log('req.body in /newprofile: ', req.body);

    if (req.body.age || req.body.city || req.body.homepage) {
        if (!req.body.homepage) {
            req.body.hompage = "";
        } else if (
            !req.body.homepage.startsWith("http://") &&
            !req.body.homepage.startsWith("https://") &&
            !req.body.homepage.startsWith("//")
        ) {
            req.body.homepage = "http://" + req.body.homepage;
        }
        req.session.homepage = req.body.homepage;

        db.logProfiles(
            [req.body.age],
            req.body.city,
            req.body.homepage,
            req.session.user_id
        )
            .then((results) => {
                //console.log('results in logprofiles: ', results);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in post/newprofile", err);
            });
    } else {
        res.redirect("/petition");
    }
});

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
        db.getPwd(req.body.email)
            .then((results) => {
                //if (!results.rows[0].pwd) {
                //    res.render("login", {
                //        layout: "main",
                //        error: true,
                //    })
                //} else {
                //comparing the user input pwd and the hashed pwd
                compare(req.body.pwd, results.rows[0].pwd)
                    .then((matchValue) => {
                        //console.log('matchValue: ', matchValue);
                        if (matchValue === true) {
                            req.session.hasUesrId = true;
                            req.session.email = req.body.email;
                            req.session.user_id = results.rows[0].id;
                            req.session.loggedIn = true;
                            //console.log('req.session after login credcomparison: ', req.session);
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                error: true,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("error in compare");
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    });
                //}
            })
            .catch((err) => {
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
            //storing the signature id in the cookie
            req.session.hasSigId = true;
            req.session.sigId = results.rows[0].id;
            res.redirect("/thankyou");
            //console.log('req.session after addSignatures: ', req.session);
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
                db.getSigUrl(req.session.user_id)
                    .then((results) => {
                        //console.log("results in getSigUrl: ", results);
                        res.render("thankyou", {
                            layout: "main",
                            thanks: `Thank you ${req.session.first}, for signing the petition!`,
                            signatures: `check out all ${signers} signatures!`,
                            dataUrl: `${results.rows[0].signature}`,
                        });
                    })
                    .catch((err) => {
                        console.log("err in GET /thankyou getSigUrl: ", err);
                    });
            } else {
                res.redirect("/petition");
            }
        })
        .catch((err) => {
            console.log("err in GET /thankyou get sigNumber: ", err);
        });
});

app.post("/thankyou", (req, res) => {
    db.deleteSig(req.session.user_id)
        .then((results) => {
            req.session.hasSigId = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in deleteSig", err);
        });
});

app.get("/signers", (req, res) => {
    db.getNames()
        .then((results) => {
            res.render("signers", {
                layout: "main",
                names: results.rows,
            });
        })

        .catch((err) => {
            console.log("err in GET /signers: ", err);
        });
});

app.get("/signers/:city", (req, res) => {
    db.getCity(req.params.city).then((results) => {
        res.render("signers", {
            layout: "main",
            names: results.rows,
        });
    });
});

app.get("/editprofile", (req, res) => {
    db.getInfo(req.session.user_id)
        .then((results) => {
            console.log("password in editprofile", results.rows[0].pwd);
            res.render("editprofile", {
                layout: "main",
                info: results.rows,
            });
        })
        .catch((err) => {
            console.log("error in GET editprofile", err);
        });
});

app.post("/editprofile", (req, res) => {
    if (req.body.pwd) {
        console.log("req.body.pwd: ", req.body.pwd);
        hash(req.body.pwd).then((hashedPwd) => {
            console.log("hashedPwd: ", hashedPwd);
            db.updatePassword(req.session.user_id, hashedPwd)
                .then((results) => {
                    //res.render("editprofile", {
                    //    layout: "main",
                    //    profileUpdate: true,
                    //});
                    //res.redirect("/editprofile");
                })
                .catch((err) => {
                    console.log("error in updatePassword", err);
                });
        });
    }

    Promise.all([
        db.updateInfo(
            req.session.user_id,
            req.body.first,
            req.body.last,
            req.body.email
        ),
        db.upsertInfo(
            req.session.user_id,
            req.body.age,
            req.body.city,
            req.body.homepage
        ),
    ])
        .then((results) => {
            profileUpdate = true;
            if (req.body.first) {
                req.session.first = req.body.first;
            }
            res.render("editprofile", {
                layout: "main",
                profileUpdate: true,
            });
        })
        .catch((err) => {
            console.log("error in POST/editprofile", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

//if running on Heroku liten on Heroku port(environment), otherwise, listen locally
app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
