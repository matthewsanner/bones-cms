if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Express & Standard Middleware
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const app = express();

let postsRouter = require('./routes/post')
let adminRouter = require('./routes/admin')

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

// Routes Declaration
app.use('/posts', postsRouter);
app.use('/admin', adminRouter);

// Listen on Port 3000
app.listen(3000, () => console.log('Server listening on port 3000...'));
