const Post = require('../models/post');
const User = require('../models/user');
const helpers = require('../helpers');


exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort('-date');

    // Fetch usernames for each post
    const postsWithUsernames = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.author);
        const username = user ? user.username : 'Unknown'; // Set a default username if user is not found
        return { ...post.toObject(), username };
      })
    );

    res.render('index', { posts: postsWithUsernames, addHashtagLinks: helpers.addHashtagLinks });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send('Server Error');
  }
};


exports.findPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    const user = await User.findById(post.author);

    if (!post) {
      // If the post is not found, return a 404 status and message
      return res.status(404).send('The post with the given ID was not found.');
    }

    // If the post is found, render the view page with the post's information
    res.render('post', { post, user, addHashtagLinks: helpers.addHashtagLinks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong...');
  }

};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.redirect(`/posts`)
};

exports.viewEditPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

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

};

exports.editPost = async (req, res) => {
  const { id } = req.params;
  const { title, content }  = req.body.post
  let post = await Post.findByIdAndUpdate(id, {title, content});
  await post.save()
  const posts = await Post.find();
  res.render('index', { posts, addHashtagLinks: helpers.addHashtagLinks });
}

exports.getHashtag = async (req, res) => {
  const { hashtag } = req.params;

  // Search for posts with the specified hashtag in the database
  const posts = await Post.find({ hashtags: hashtag }).sort('-date');

  const postsWithUsernames = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.author);
        const username = user ? user.username : 'Unknown'; // Set a default username if user is not found
        return { ...post.toObject(), username };
      })
    );

  // Render the view page with the list of posts containing the hashtag
  res.render('hashtag', { hashtag, posts: postsWithUsernames, addHashtagLinks: helpers.addHashtagLinks });
};



