const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const {listingSchema}= require("../schema.js");
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//New
router.get("/new",isLoggedIn, wrapAsync(listingController.renderNewForm));

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image][file]"), validateListing,wrapAsync(listingController.addNewListing))

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner ,  upload.single("listing[image][file]"),validateListing ,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn , isOwner, wrapAsync(listingController.deleteListing));

//edit 
router.get("/:id/edit" ,isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;