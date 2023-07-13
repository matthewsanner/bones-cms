const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user')

exports.getComments = async (req, res) => {
  console.log("hit get comments in")
  const comments = await Comment.find().sort("-date");
  console.log(comments)
}

exports.createComment = async (req, res) => {
  const username = req.session.passport.user;

  try {
    // Find the user document based on the username
    const user = await User.findOne({ username }, '_id').exec();

    if (!user) {
      // User not found
      return res.status(404).json({ error: 'User not found' });
    }

    // User found, retrieve the user ID
    const userId = user._id;

    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      postID: req.body.postID,
      userID: userId,
    });

    // Save the comment
    await comment.save();

    // Return the appropriate response
    res.redirect("../");

  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }

};

