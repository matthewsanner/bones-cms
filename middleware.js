// const { cardSetSchema, cardSchema } = require('./schemas.js')
// const ExpressError = require('./utilities/ExpressError');
const Post = require("./models/post");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // if (req.originalUrl) {
    //     req.session.returnTo = req.originalUrl;
    // }
    req.flash("error", "You must be signed in!");
    return res.redirect("/users/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (post && !post.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/posts/${id}`);
  }
  next();
};

module.exports.isSuperadmin = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "superadmin") {
    // User is a superadmin, move to the next middleware
    return next();
  }
  // User is not a superadmin, flash an error message and redirect
  req.flash("error", "You do not have permission to access this page.");
  res.redirect("/"); // Replace with the appropriate redirect URL
};
