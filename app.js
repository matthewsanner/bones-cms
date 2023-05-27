if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Express & Standard Middleware
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const User = require('./models/user');
const app = express();

let postsRouter = require('./routes/post')
let adminRouter = require('./routes/admin')
let usersRouter= require('./routes/user')

// Connect to MongoDB
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Connect App to Middleware

// EJS as View Engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Parse HTTP request body
app.use(bodyParser.urlencoded({ extended: true }));

// Override Default HTML Method Requests
app.use(methodOverride('_method'));

// Serve Static Files from the "public" Directory
app.use(express.static('public'));

// Authentication/ Authorization
const secret = process.env.SECRET;

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 // doesn't update db if same for amount of seconds
});

store.on('error', function (e) {
    console.log('Session store error', e)
});

const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // protect against cookies being extracted by a javascript attack
        httpOnly: true,
        // you want this setting for shtml but doesn't work on local server
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes Declaration
app.use('/posts', postsRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);

// Listen on Port 3000
app.listen(3000, () => console.log('Server listening on port 3000...'));
