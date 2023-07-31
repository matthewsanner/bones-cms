const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user')

exports.getComments = async (req, res) => {
  const comments = await Comment.find().sort("-date");
}

exports.createComment = async (req, res) => {

  const username = req.session.passport.user;

  try {
    const user = await User.findOne({ username }, '_id').exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = user._id;

    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      postID: req.body.postID,
      userID: userId,
    });

    await comment.save();
    res.redirect(`/${req.body.postID}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }

};

