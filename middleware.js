//pasting here, so I could see the cases I wanted to check:

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

////////////////////////////////////////
module.exports.requireSignedUser = function requireSignedUser(req, res, next) {
    //is the user signed in?
    if (!req.session.hasUserId || !req.session.user_Id) {
        res.redirect("/reg");
    } else {
        next();
    }
};

module.exports.requireHasSig = function requireHasSig(req, res, next) {
    //has the user signed the petition?
    if (req.session.userId && req.session.sigId) {
        res.redirect("/thankyou");
    } else if (req.session.user_Id && !req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSig = function requireNoSig(req, res, next) {
    //has the user signed the petition?
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

//module.exports.requireLoggedIn = function requireLoggedIn(req, res, next) {
//    //has the user signed the petition?
//    if (req.session == null) {
//        res.redirect("/");
//    } else {
//        next();
//    }
//};

//checking if user is NOT logged in:
//using req.session !=null?
