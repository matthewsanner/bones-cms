const Post = require('../models/post');
const helpers = require('../helpers');

exports.viewAdmin = (req, res) => {
  res.render('admin')
};

exports.createPost = async (req, res) => {

  console.log(req.body)
  
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
  res.redirect('/posts')
};

