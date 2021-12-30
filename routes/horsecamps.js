const express = require('express');
const router = express.Router();
const horsecamps = require('../controllers/horsecamps');
const catchAsync = require('../utils/catchAsync');
const { horsecampSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateHorsecamp } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Horsecamp = require('../models/horsecamp');


router.route('/')
    .get(catchAsync(horsecamps.index))
    .post(isLoggedIn, upload.array('image'), validateHorsecamp, catchAsync(horsecamps.createHorsecamp));


router.get('/new', isLoggedIn, horsecamps.renderNewForm);


router.route('/:id')
    .get(catchAsync(horsecamps.showHorsecamp))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateHorsecamp, catchAsync(horsecamps.updateHorsecamp))
    .delete(isLoggedIn, isAuthor, catchAsync(horsecamps.deleteHorsecamp));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(horsecamps.renderEditForm));



module.exports = router;