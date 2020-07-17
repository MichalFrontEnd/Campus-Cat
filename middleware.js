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

module.exports.requireLoggedOutUser = function requireLoggedOutUser(req, res, next) {
    //is the user logged in?
    if (req.session.hasUesrId) {
        res.redirect('/petition');
    } else {
        //runs if the user is NOT logged in!
        //don't redirect the user, allow him to enter reg/login
        next();
    }
}

module.exports.requireNoSignature = function requireNoSignature(req, res, next) {
    //has the user signed the petition?
    if (req.session.hasSigId) {
        res.redirect("/thankyou");
    } else {
        next();
    }
}

//checking if user is NOT logged in:
//using req.session !=null?