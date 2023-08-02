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

exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the comment's userID matches the current logged-in user's ID
    if (comment.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    // If the user is authorized, delete the comment
    await Comment.findByIdAndDelete(id);
    res.redirect(`/${comment.postID}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.editComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the comment's userID matches the current logged-in user's ID
    if (comment.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to edit this comment' });
    }

    // If the user is authorized, update the comment content
    comment.content = content;
    await comment.save();
    res.redirect(`/${comment.postID}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

