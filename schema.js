const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().optional(),
            url: Joi.string().allow(null, "").optional()
        }).optional(),
        category: Joi.string().valid("Mountains", "Pool", "Iconic Cities", "Camping", "Beach", "Hostels", "Pilgrimage").required()
    }).required()
});
// module.exports.listingSchema = Joi.object({
//     listing: Joi.object({
//         title: Joi.string().required(),
//         description: Joi.string().required(),
//         location: Joi.string().required(),
//         country: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         image: Joi.object({
//             filename: Joi.string().optional(),
//             url: Joi.string().allow(null, "").optional()
//         }).optional()
//     }).required()
// });

// module.exports.listingSchema = Joi.object({
//     listing: Joi.object({
//         title: Joi.string().required(),
//         description: Joi.string().required(),
//         location: Joi.string().required(),
//         country: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         image: Joi.object({
//             filename: Joi.string().optional(),
//             url: Joi.string().allow(null, "").optional()
//         }).optional(),
//         category: Joi.string().valid("Trending","Mountains","Pool","Iconic Cities","Camping","Beach","Hostels","Pilgrimage").optional(),
//     }).required()
// });


module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});