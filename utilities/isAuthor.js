const Post = require("../models/post");

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (post && !post.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/posts/${id}`);
  }
  next();
};

module.exports = isAuthor