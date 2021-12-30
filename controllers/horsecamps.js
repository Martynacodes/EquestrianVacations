const Horsecamp = require('../models/horsecamp');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const horsecamps = await Horsecamp.find({});
    res.render('horsecamps/index', { horsecamps })
}

module.exports.renderNewForm = (req, res) => {
    res.render('horsecamps/new');
}

module.exports.createHorsecamp = async (req, res, next) => {
    const horsecamp = new Horsecamp(req.body.horsecamp);
    horsecamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    horsecamp.author = req.user._id;
    await horsecamp.save();
    console.log(horsecamp);
    req.flash('success', 'Successfully created a new horsecamp!');
    res.redirect(`/horsecamps/${horsecamp._id}`)
};

module.exports.showHorsecamp = async (req, res,) => {
    const horsecamp = await Horsecamp.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(horsecamp);
    if (!horsecamp) {
        req.flash('error', 'Cannot find that horsecamp!');
        return res.redirect('/horsecamps');
    }
    res.render('horsecamps/show', { horsecamp });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const horsecamp = await Horsecamp.findById(id);
    if (!horsecamp) {
        req.flash('error', 'Cannot find the horsecamp you are looking for.');
        return res.redirect('/horsecamps');
    }
    res.render('horsecamps/edit', { horsecamp });
};

module.exports.updateHorsecamp = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const horsecamp = await Horsecamp.findByIdAndUpdate(id, { ...req.body.horsecamp });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    horsecamp.images.push(...imgs);
    await horsecamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await horsecamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated horsecamp!');
    res.redirect(`/horsecamps/${horsecamp._id}`)
};

module.exports.deleteHorsecamp = async (req, res) => {
    const { id } = req.params;
    await Horsecamp.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted horsecamp!');
    res.redirect('/horsecamps');
};

