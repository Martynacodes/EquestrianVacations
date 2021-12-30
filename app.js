if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const { horsecampSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');


const User = require('./models/user');
const Horsecamp = require('./models/horsecamp');
const Review = require('./models/review');


const usersRoutes = require('./routes/users');
const horsecampsRoutes = require('./routes/horsecamps');
const reviewsRoutes = require('./routes/reviews');

// const dbUrl = process.env.DB_URL;

const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/equestrian-vacations';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindandModify: false,

});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const secret = 'thisshouldbeasecret';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    // Don't update when the user refreshes the page if the data in the session hasn't changed. If it has changed, then save and update.
    touchAfter: 24 * 60 * 60
    // total number of seconds
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})


const sessionConfig = {
    store,
    name: 'ponyland',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'marysiaelo@gmail.com', username: 'elosiemaelo' });
//     const registeredUser = await User.register(user, 'ziemniaki');
//     res.send(registeredUser)
// });


app.use('/', usersRoutes);
app.use('/horsecamps', horsecampsRoutes);
app.use('/horsecamps/:id/reviews', reviewsRoutes);


app.get('/', (req, res) => {
    res.render('../views/home.ejs');
});



app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})


