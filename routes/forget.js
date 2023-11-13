var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));

router.get("/forget", function (req, res, next) {
    res.render("forget", { admin: req.user });
});

module.exports=router
