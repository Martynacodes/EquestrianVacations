const { horsecampSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Horsecamp = require('./models/horsecamp');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    console.log("REQ.USER...", req.user);
    if (!req.isAuthenticated()) {
        // store the url they're requesting
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to access this page.');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateHorsecamp = (req, res, next) => {
    const { error } = horsecampSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const horsecamp = await Horsecamp.findById(id);
    if (!horsecamp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/horsecamps/${id}`);
    }
    next();
}



module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/horsecamps/${id}`);
    }
    next();
}



module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}