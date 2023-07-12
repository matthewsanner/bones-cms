const Post = require("../models/post");

const isAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      req.flash("error", "Post not found.");
      return res.redirect("/");
    }

    if (!post.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect(`/${id}`);
    }

    next();
  } catch (err) {
    console.error("Error in isAuthor middleware:", err);
    req.flash("error", "An error occurred. Please try again later.");
    res.redirect("/");
  }
};

module.exports = isAuthor;
