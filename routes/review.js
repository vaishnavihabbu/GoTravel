const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}= require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

//review post
router.post("/" ,isLoggedIn, validateReview ,wrapAsync(reviewController.createReview) );

//review delete 
router.delete("/:reviewId",isLoggedIn,isAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;