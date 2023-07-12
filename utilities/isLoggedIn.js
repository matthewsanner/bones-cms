const isLoggedIn = (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be signed in!");
      return res.redirect("/users/login");
    }
    next();
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err);
    req.flash("error", "An error occurred. Please try again later.");
    res.redirect("/");
  }
};

module.exports = isLoggedIn;
