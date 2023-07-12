const User = require("../models/user");

// FIX: need to update error handling to newer more user friendly version
const verifyToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verify the token against the stored value in MongoDB using the User model
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      throw new Error("Invalid token");
    }

    // Attach the user object to the request for further processing in the route handler
    req.username = user.username;
    req.email = user.email;
    console.log("Found user with token");
    next();
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/posts");
  }
};

module.exports = verifyToken;
