const jwt = require("jsonwebtoken");

module.exports = {
    ensureAuth: function (req, res, next) {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    res.redirect("/auth/login");
                } else {
                    req.userId = decoded.id;
                    return next();
                }
            });
        } else {
            res.redirect("/auth/login");
        }
    },

    ensureGuest: function (req, res, next) {
        const token = req.cookies.jwt;

        if (!token) {
            next();
        }
    },
};
