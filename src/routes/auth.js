const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Normal Register Login
router.get("/register", (req, res) => {
    res.render("register");
});
router.post("/register", require("../controllers/authController").register);

router.get("/login", (req, res) => {
    res.render("login");
});
router.post("/login", require("../controllers/authController").login);

router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

// login/signup with github
router.get("/github", passport.authenticate("github", { session: false, scope: ["user:email"] }));
router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect home.
        // res.send("nice!");
        const jwtToken = jwt.sign({ id: req.user.dataValues.id }, process.env.JWT_SECRET, {
            expiresIn: "30s",
        });
        res.cookie("jwt", jwtToken, { httpOnly: true });

        res.redirect("/dashboard");
    }
);

module.exports = router;
