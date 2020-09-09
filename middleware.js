module.exports.requireSignedUser = function requireSignedUser(req, res, next) {
    //is the user signed in?
    if (!req.session.user_id) {
        res.redirect("/reg");
    } else {
        next();
    }
};

module.exports.requireHasSig = function requireHasSig(req, res, next) {
    //has the user signed the petition?
    if (req.session.user_id && req.session.sigId) {
        res.redirect("/thankyou");
    } else {
        next();
    }
};

module.exports.requireNoSig = function requireNoSig(req, res, next) {
    //has the user signed the petition?
    if (req.session.user_id && !req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};
