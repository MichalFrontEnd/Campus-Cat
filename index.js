const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const hb = require("express-handlebars");
const db = require("./db");
const {
    requireSignedUser,
    requireHasSig,
    requireNoSig,
    requireLoggedIn,
} = require("./middleware");
const csurf = require("csurf");

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

app.use(csurf());

app.use(function (req, res, next) {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

let signers;
let first;
let last;
let email;
let userPwd;
let user_id;

app.get("/", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/home");
    } else {
        res.redirect("/reg");
    }
});

app.get("/home", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.get("/reg", requireHasSig, requireNoSig, (req, res) => {
    res.render("reg", {
        layout: "main",
    });
});

app.post("/reg", requireHasSig, requireNoSig, (req, res) => {
    hash(req.body.pwd)
        .then((hashedPwd) => {
            db.logCreds(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPwd
            )
                .then((results) => {
                    //storing the user_id and name in the cookie:
                    req.session.user_id = results.rows[0].id;
                    req.session.hasUserId = true;
                    req.session.first = req.body.first;

                    res.redirect("/newprofile");
                })
                .catch((err) => {
                    console.log("err in logCreds in POST /reg: ", err);
                    if (err.code === "23505") {
                        res.render("reg", {
                            layout: "main",
                            duplicateKey: true,
                        });
                    } else {
                        res.render("reg", {
                            layout: "main",
                            error: true,
                        });
                    }
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
    //if (req.body.age || req.body.city || req.body.homepage) {
    if (!req.body.homepage) {
        req.body.hompage = "";
    } else if (
        !req.body.homepage.startsWith("http://") &&
        !req.body.homepage.startsWith("https://") &&
        !req.body.homepage.startsWith("//")
    ) {
        req.body.homepage = "http://" + req.body.homepage;
    }

    db.logProfiles(
        [req.body.age],
        req.body.city,
        req.body.homepage,
        req.session.user_id
    )
        .then(() => {
            //console.log('results in logprofiles: ', results);
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in post/newprofile", err);
        });
    //} else {
    //    res.redirect("/petition");
    //}
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
        //console.log("req.body.email: ", req.body.email);
        db.getPwd(req.body.email)
            .then((results) => {
                console.log("results in getPwd: ", results);
                if (!results.rows[0].pwd) {
                    res.render("login", {
                        layout: "main",
                        error: true,
                    });
                } else {
                    //comparing the user input pwd and the hashed pwd
                    compare(req.body.pwd, results.rows[0].pwd)
                        .then((matchValue) => {
                            if (matchValue === true) {
                                //req.session.email = req.body.email;
                                req.session.first = results.rows[0].first;
                                req.session.user_id = results.rows[0].id;
                                req.session.sigId = results.rows[0].sigid;
                                res.redirect("/thankyou");
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
                }
            })
            .catch((err) => {
                console.log("err in Post /login getting creds: ", err);
                res.render("login", {
                    layout: "main",
                    error: true,
                });
            });
    } else {
        res.render("login", {
            layout: "main",
            error: true,
        });
    }
});

//app.use(function reroute(req, res, next) {
//    if (req.session === null) {
//        res.redirect("/reg");
//    } else{
//next;
//}
//});

app.get("/petition", requireSignedUser, requireHasSig, (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", requireSignedUser, requireHasSig, (req, res) => {
    db.addSignatures(req.session.user_id, req.body.signature)
        .then((results) => {
            //storing the signature id in the cookie

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

app.get("/thankyou", requireSignedUser, requireNoSig, (req, res) => {
    db.sigNumber()
        .then((results) => {
            signers = results.rows[0].count;
            db.getSigUrl(req.session.user_id)
                .then((results) => {
                    res.render("thankyou", {
                        layout: "main",
                        thanks: `Thank you ${req.session.first}, for your paw-print!`,
                        signatures: `check out our purrrrfect ${signers} supporters!`,
                        dataUrl: `${results.rows[0].signature}`,
                    });
                })
                .catch((err) => {
                    console.log("err in GET /thankyou getSigUrl: ", err);
                });
        })
        .catch((err) => {
            console.log("err in GET /thankyou get sigNumber: ", err);
        });
});

app.post("/thankyou", requireSignedUser, requireNoSig, (req, res) => {
    db.deleteSig(req.session.user_id)
        .then((results) => {
            req.session.hasSigId = false;
            req.session.sigId = "";
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in deleteSig", err);
        });
});

app.get("/signers", requireSignedUser, requireNoSig, (req, res) => {
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

app.get("/signers/:city", requireSignedUser, requireNoSig, (req, res) => {
    db.getCity(req.params.city).then((results) => {
        res.render("signers", {
            layout: "main",
            names: results.rows,
        });
    });
});

app.get("/editprofile", requireSignedUser, (req, res) => {
    db.getInfo(req.session.user_id)
        .then((results) => {
            res.render("editprofile", {
                layout: "main",
                info: results.rows,
            });
        })
        .catch((err) => {
            console.log("error in GET editprofile", err);
        });
});

app.post("/editprofile", requireSignedUser, (req, res) => {
    if (req.body.pwd) {
        hash(req.body.pwd).then((hashedPwd) => {
            db.updatePassword(req.session.user_id, hashedPwd)
                .then((results) => {
                    //console.log("Password changed successfuly");
                })
                .catch((err) => {
                    console.log("error in updatePassword", err);
                });
        });
    }
    if (!req.body.homepage) {
        req.body.hompage = "";
    } else if (
        !req.body.homepage.startsWith("http://") &&
        !req.body.homepage.startsWith("https://") &&
        !req.body.homepage.startsWith("//")
    ) {
        req.body.homepage = "http://" + req.body.homepage;
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
        .then(() => {
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
    res.redirect("/reg");
});

//if running on Heroku liten on Heroku port(environment), otherwise, listen locally
app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
