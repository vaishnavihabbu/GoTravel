if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const DB_URL=process.env.ATLASDB_URL;
const Store = MongoStore.create({
    mongoUrl:DB_URL,
    crypto:{
        secret:process.env.SECRET,
        touchAfter:24*3600
    }
});

Store.on("error" ,()=>{
    console.log("Error in mgs");
})
const sessionOptions = 
    {   Store,
        secret: process.env.SECRET, 
        resave:false , 
        saveUninitialized:true,
        cookie:{
            expires:Date.now() + 7 *24*60*60*1000,
            maxAge: 7*24*60*60*1000,
            httpOnly:true,
        },
    };
const flash = require("connect-flash");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/user.js");



app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser =req.user;
    next(); 
});

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs" , ejsMate);

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use(userRouter);

async function main(){
    await mongoose.connect(DB_URL);
};

main()
    .then((res)=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

app.use((err,req,res,next)=>{
    let{status = 500 , message="something went wrong!" } = err;
    // res.render("error.ejs");
    res.status(status).render("error.ejs", { message });
})

app.listen(port , ()=>{
    console.log(`listening on port ${port}`);
});