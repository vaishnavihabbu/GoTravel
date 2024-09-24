const User = require("../models/user");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {listingSchema , reviewSchema} = require("../schema.js");


module.exports.renderSignUp = async (req , res)=>{
    res.render("users/signup.ejs");
};

module.exports.userSignUp = async (req,res)=>{
    try{
        let {username , email,password} = req.body;
        const newUser = User({email,username});
        const registeredUser = await User.register(newUser , password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            else{
                req.flash("success" , "Welcome to GoTravel!");
                res.redirect("/listings");
            }
        });
    }catch(e){
        req.flash("error" , e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogIn = async (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.userLogIn = async (req,res)=>{
    req.flash("success" , "Welcome back to GoTravel");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.userLogOut = (req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }else{
            req.flash("success" , "You have Logged out Successfully");
            res.redirect("/listings");
        }
    })
};