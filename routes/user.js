const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapasync.js");
const passport = require("passport");
const localStratergy = require("passport-local");
const { saveRedirectUrl } = require("../middleware.js");
const userControllers = require("../controllers/user.js");


router.route("/login")
    .get(wrapAsync(userControllers.renderLogIn))
    .post(saveRedirectUrl, passport.authenticate("local" , {failureRedirect: '/login' , failureFlash:true}),userControllers.userLogIn );


router.route("/signup")
    .get(userControllers.renderSignUp)
    .post(wrapAsync(userControllers.userSignUp));

router.get("/logout" , userControllers.userLogOut);

module.exports = router;