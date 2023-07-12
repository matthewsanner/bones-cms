const isSuperadmin = async (req, res, next) => {
  try {
    if (req.isAuthenticated() && req.user.role === "superadmin") {
      // User is a superadmin, move to the next middleware
      return next();
    }

    // User is not a superadmin, throw an error
    throw new Error("You do not have permission to access this page.");
  } catch (err) {
    // Handle the error
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/");
  }
};

module.exports = isSuperadmin;
