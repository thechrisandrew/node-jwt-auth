const express = require("express");
const { ensureAuth } = require("../middlewares/checkAuth");

const router = express.Router();

router.get("/", ensureAuth, (req, res) => {
    res.render("dashboard");
});

module.exports = router;
