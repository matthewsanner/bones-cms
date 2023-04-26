const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Connect to MongoDB
const dbUrl = 'mongodb://127.0.0.1:27017/blog';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Define a schema for our blog post
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

// Create a model for our blog post
const Post = mongoose.model('Post', postSchema);

// Use EJS as our view engine
app.set('view engine', 'ejs');

// Use body-parser middleware to parse HTTP request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Render the blog page with all posts
app.get('/', async (req, res) => {
  const posts = await Post.find().sort('-date');
  res.render('index', { posts });
});

// Render the admin page with a form to add a new post
app.get('/admin', (req, res) => {
  res.render('admin');
});

// Handle the form submission to add a new post
app.post('/admin', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  await post.save();
  res.redirect('/');
});

// Start the server and listen on port 3000
app.listen(3000, () => console.log('Server listening on port 3000...'));