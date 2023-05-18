if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const app = express();

const helpers = require('./helpers');

// Connect to MongoDB
const dbUrl = process.env.DB_URL;
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
  hashtags: [String],
  date: { type: Date, default: Date.now }
});

// Create a model for our blog post
const Post = mongoose.model('Post', postSchema);

// Use EJS as our view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Use body-parser middleware to parse HTTP request body
app.use(bodyParser.urlencoded({ extended: true }));

// Override default HTML method requests
app.use(methodOverride('_method'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Render the blog page with all posts
app.get('/', async (req, res) => {
  const posts = await Post.find().sort('-date');
  res.render('index', { posts, addHashtagLinks: helpers.addHashtagLinks });
});

// Render the admin page with a form to add a new post
app.get('/admin', (req, res) => {
  res.render('admin');
});

// Handle the form submission to add a new post
app.post('/admin', async (req, res) => {
  const hashtagArray = (content) => {
    // Match all words starting with '#' and followed by any non-space character
    const hashtagRegex = /#\w+\b/g;

    // Extract all the hashtags from the post content
    const hashtags = content.match(hashtagRegex);

    // If no hashtags are found, return an empty array
    if (!hashtags) {
      return [];
    }

    // Remove the '#' symbol from each hashtag and return the result
    return hashtags.map(hashtag => hashtag.substring(1));
  };

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    hashtags: hashtagArray(req.body.content)
  });
  await post.save();
  res.redirect('/');
});

app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      // If the post is not found, return a 404 status and message
      return res.status(404).send('The post with the given ID was not found.');
    }

    // If the post is found, render the view page with the post's information
    res.render('post', { post, addHashtagLinks: helpers.addHashtagLinks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong...');
  }

});

app.get('/posts/delete/:postId', async (req, res) => {
  const {postId} = req.params;
  await Post.findByIdAndDelete(postId);
  res.redirect(`/`);
})

app.get('/posts/edit/:postId', async (req, res) => {
  const {postId} = req.params;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      // If the post is not found, return a 404 status and message
      return res.status(404).send('The post with the given ID was not found.');
    }

    // If the post is found, render the view page with the post's information
    res.render('edit', { post });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong...');
  }

})

app.put('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { title, content }  = req.body.post
  let post = await Post.findByIdAndUpdate(postId, {title, content});
  await post.save()
  const posts = await Post.find().sort('-date');
  res.render('index', { posts, addHashtagLinks: helpers.addHashtagLinks });
})

app.get('/hashtags/:hashtag', async (req, res) => {
  const { hashtag } = req.params;

  // Search for posts with the specified hashtag in the database
  const posts = await Post.find({ hashtags: hashtag });

  // Render the view page with the list of posts containing the hashtag
  res.render('hashtag', { hashtag, posts, addHashtagLinks: helpers.addHashtagLinks });
});

// Start the server and listen on port 3000
app.listen(3000, () => console.log('Server listening on port 3000...'));