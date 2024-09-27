const Listing = require("../models/listing.js");
const review = require("../models/review.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:'pk.eyJ1IjoidmFpc2huYXZpaGFiYnUiLCJhIjoiY20xZjZ6ZnR6MWJraTJrczY1dDN4eno5cyJ9.itqWf_fYDlPvz6u7CqIiRA'});

// module.exports.index = async (req,res)=>{
//     const { category } = req.query; // Get category from query params
//     let query = {};
    
//     if (category && category !== 'All') {
//         query = { category: category }; // Add filter condition if category is provided and not 'All'
//     }
    
//     const allListings = await Listing.find(query);
//     res.render("./listings/index.ejs" , { allListings });
// };

// module.exports.index = async (req, res) => {
//   const { category } = req.query; // Get category from query params
//   let query = {};

//   if (category === 'Trending') {
//     const allListings = await Listing.aggregate([
//       {
//         $lookup: {
//           from: 'reviews', // Name of the reviews collection
//           localField: 'reviews',
//           foreignField: '_id',
//           as: 'reviews',
//         },
//       },
//       {
//         $addFields: {
//           avgRating: { $avg: '$reviews.rating' }, // Calculate average rating
//         },
//       },
//       {
//         $match: { avgRating: 5 }, // Filter listings with average rating of 5
//       },
//     ]);

//     res.render('./listings/index.ejs', { allListings });
//   } else {
//     if (category) {
//       query = { category: category }; // Add filter condition if category is provided
//     }

//     const allListings = await Listing.find(query);
//     res.render('./listings/index.ejs', { allListings });
//   }
// };

module.exports.index = async (req, res) => {
  const { category, query } = req.query; // Get category and search query from query params
  let listingQuery = {};

  if (query) {
      // If there is a search query, perform a regex search
      listingQuery = {
          $or: [
              { title: new RegExp(query, 'i') },  // Search by title
              { description: new RegExp(query, 'i') }, // Search by description
              { location: new RegExp(query, 'i') }  // Search by location
          ]
      };
  }

  if (category) {
      // If a category is provided, add it to the query
      listingQuery.category = category;
  }

  const allListings = await Listing.find(listingQuery);
  // Check if category filter is applied and handle it if necessary
  if (category === 'Trending') {
      const trendingListings = await Listing.aggregate([
          {
              $lookup: {
                  from: 'reviews', // Name of the reviews collection
                  localField: 'reviews',
                  foreignField: '_id',
                  as: 'reviews',
              },
          },
          {
              $addFields: {
                  avgRating: { $avg: '$reviews.rating' }, // Calculate average rating
              },
          },
          {
              $match: { avgRating: 5 }, // Filter listings with average rating of 5
          },
      ]);

      res.render('./listings/index.ejs', { allListings: trendingListings });
  } else {
      res.render('./listings/index.ejs', { allListings });
  }
};


module.exports.renderNewForm = async (req,res)=>{
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews" , populate:{path:"author"}}).populate("owner");
    let avgRating=1;
    // if(listing.reviews){
    //   let listingArr = listing.reviews;
    //   let sumRating = 0;
    //   let countReviews = listingArr.length;
    //   for(listingEach of listingArr){
    //     sumRating = sumRating+(listingEach.rating);
    //     avgRating = sumRating/countReviews;
    //   }
    // }
    // console.log(avgRating);
    let coordinates = listing.geometry.coordinates;
    if(!listing){
        req.flash("error" , "Listing does not exist");
        res.redirect("/listings");
    }
    else{
        res.render("./listings/show.ejs", {listing , coordinates});
    }
};

// module.exports.addNewListing = async (req,res, next )=>{
//     let response = await geocodingClient.forwardGeocode({
//         query: req.body.listing.location,
//         limit: 1
//       })
//         .send();
//     if(!req.body.listing){
//         throw new ExpressError(400 , "Send valid data for listing");
//     }
//         // let url = req.file.path;
//         // let filename = req.file.filename;

//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
//         // newListing.image = {filename , url};
//         newListing.geometry = (response.body.features[0].geometry);
//         await newListing.save();
//         let result = listingSchema.validate(req.body);
//         req.flash("success" , "New Listing Created!");
//         res.redirect("/listings");
// };

module.exports.addNewListing = async (req, res, next) => {
    try {
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();
  
      if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
      }
  
      // Create the new listing with the form data
      const newListing = new Listing(req.body.listing);
  
      // Add owner and geometry data
      newListing.owner = req.user._id;
      newListing.geometry = response.body.features[0].geometry;
  
      // Handle image file from req.file (assuming you are using multer with Cloudinary)
      if (req.file) {
        newListing.image = {
          url: req.file.path,
          filename: req.file.filename
        };
      }
  
      // Handle filtering based on category
      if (req.body.listing.category) {
        newListing.category = req.body.listing.category;
      }
  
      // Validate and save the listing
      let result = listingSchema.validate(req.body);
      await newListing.save();
  
      // Send success message
      req.flash("success", "New Listing Created!");
      res.redirect("/listings");
  
    } catch (err) {
      next(err);
    }
  };

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing does not exist");
        res.redirect("/listings");
    }
    else{
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/uplaod" , "/upload/h_300,w_250") 
        res.render("./listings/edit.ejs" ,{listing , originalImageUrl});
    }
};

// module.exports.updateListing = async (req,res)=>{
//     if(!req.body.listing){
//         throw new ExpressError(400 , "Send valid data for listing");
//     }
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
//     if(typeof req.file !== undefined){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {filename , url};
//         await listing.save();
//     }
//     req.flash("success" , "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) { // Check if req.file is defined
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async(req,res)=>{
    let{ id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing Deleted");
    res.redirect("/listings");
};
