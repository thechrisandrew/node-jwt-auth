const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Op } = require("sequelize");
const db = require("../models");
const User = db.user;

const joiRegisterSchema = joi.object({
    username: joi.string().min(6),
    email: joi.string().min(6).required().email(),
    password: joi.string().min(8),
});

// Register Route Controller
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    //Validate using Joi
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const isEmailExists = await User.findOne({ where: { email } });
    if (isEmailExists) {
        return res.json({ message: "This email has already been registered" });
    }

    const isUsernameTaken = await User.findOne({ where: { username } });
    if (isUsernameTaken) {
        return res.json({ message: "username has been taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ username, email, password: hashedPassword });

    // Create New User Entry
    const savedUser = await newUser.save().catch((err) => {
        console.error(err);
        res.json({ error: "An Internal Server Error Occured" });
    });
    if (savedUser) {
        // res.json({ message: "Successfully registered new user account" });
        res.redirect(200, "/auth/login");
    }
};

const joiLoginSchema = joi.object({
    identification: joi.string().min(6).required(),
    password: joi.string().min(8).required(),
});

// Login Route Controller
exports.login = async (req, res) => {
    const { identification, password } = req.body;

    //Validate using Joi
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const foundUser = await User.findOne({
        where: { [Op.or]: [{ email: identification }, { username: identification }] },
    }).catch((err) => {
        console.log("Error: ", err);
    });

    if (!foundUser) {
        return res.json({ message: "No user found with that record" });
    }

    if (!foundUser.password) {
        return res.json({ message: "This user seems to have been registered with another method" });
    }

    const checkMatch = await bcrypt.compare(password, foundUser.password);
    if (!checkMatch) {
        return res.json({ message: "No user found with that record" });
    }

    const jwtToken = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    res.cookie("jwt", jwtToken, { httpOnly: true });
    // res.json({ message: "Successfully Logged In!", token: jwtToken });
    res.redirect("/dashboard");
};
