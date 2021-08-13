const passport = require("passport");
const passportJwt = require("passport-jwt");
const passportGithub = require("passport-github2");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const db = require("../models");
const User = db.user;

const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;

passport.use(
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        function (jwtPayload, done) {
            return User.findOne({ where: { id: jwtPayload.id } })
                .then((user) => {
                    return done(null, user);
                })
                .catch((err) => {
                    return done(err);
                });
        }
    )
);

const GithubStrategy = passportGithub.Strategy;

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/auth/github/callback",
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            // console.log(profile);
            const username = await profile.username;
            const email = await profile.emails[0].value;

            // Create User if email doesnt exists in DB /
            return User.findOrCreate({
                where: { email },
                defaults: { username: uuidv4(), email, verified: true },
            })
                .then((user) => {
                    return done(null, user[0]);
                })
                .catch((err) => {
                    return done(err);
                });
        }
    )
);
