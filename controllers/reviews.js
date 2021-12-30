const Horsecamp = require('../models/horsecamp');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const horsecamp = await Horsecamp.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    horsecamp.reviews.push(review);
    await review.save();
    await horsecamp.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/horsecamps/${horsecamp._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Horsecamp.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/horsecamps/${id}`);
};