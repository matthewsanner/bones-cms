const User = require("../models/user");
const generateVerificationToken = require("../utilities/tokenGenerator");
const transporter = require("../utilities/email");
const tokenGenerator = require("../utilities/tokenGenerator");
const passport = require("passport");
const LocalStrategy = require("passport-local");

module.exports.renderRegister = (req, res) => {
  res.render("register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "An account is already registered with this email");
      return res.redirect("/users/register");
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("error", "This username is taken, please choose a new one");
      return res.redirect("/users/register");
    }
    const verificationToken = generateVerificationToken();
    const verificationLink = `http://localhost:3000/users/verify/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Please click the following link to verify your email:</p>
           <a href="${verificationLink}">Verify Email</a>`,
    };
    const user = new User({ username, email, verificationToken });
    const registeredUser = await User.register(user, password);

    let verificationEmailFlashMessage;

    // Send verification email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        verificationEmailFlashMessage = "Failed to send verification email";
      } else {
        console.log("Email sent: " + info.response);
        verificationEmailFlashMessage = "Verification email sent!";
      }

      // Login user after registration using passport helper method
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        if (verificationEmailFlashMessage) {
          req.flash("info", verificationEmailFlashMessage);
        }
        req.flash("success", "Welcome to Bones CMS!");
        res.redirect("/");
      });
    });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

module.exports.handleVerifyToken = async (req, res) => {
  try {
    const username = req.username;

    // Update user's account status as verified
    await User.updateOne(
      { username: username },
      { $set: { verified: true, verificationToken: "" } }
    );

    req.flash("success", "Email verified successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error updating user:", err);
    req.flash("error", "Email was not successfully verified");
    res.redirect("/");
  }
};

module.exports.renderForgot = (req, res) => {
  res.render("forgot");
};

module.exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No user found with this email address");
    }

    if (!user.verified) {
      throw new Error(
        "Please verify your account before resetting the password"
      );
    }

    const verificationToken = generateVerificationToken();
    const verificationLink = `http://localhost:3000/users/forgot/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Please click the following link to reset your password:</p>
           <a href="${verificationLink}">Reset Password</a>`,
    };

    await User.updateOne(
      { email: email },
      { $set: { verificationToken: verificationToken } }
    );

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        throw new Error("Failed to send reset password email");
      } else {
        console.log("Email sent: " + info.response);
        req.flash("success", "Reset password email sent!");
        res.redirect("/");
      }
    });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/users/forgot");
  }
};

module.exports.renderChangePassword = (req, res) => {
  res.render("changePassword", { username: req.username });
};

module.exports.newPassword = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("register");
    }

    // Set the new password using Passport's setPassword method
    await user.setPassword(password);

    await user.save();

    req.flash("success", "Password updated successfully");
    res.redirect("/users/login");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/");
};

module.exports.logout = async (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        throw new Error("An error occurred during logout. Please try again.");
      }
      req.flash("success", "Logged out!");
      res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred during logout. Please try again.");
    res.redirect("/");
  }
};

module.exports.renderSuperadmin = (req, res) => {
  res.render("superadmin");
};

module.exports.inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "An account is already registered with this email");
      return res.redirect("/users/superadmin");
    }
    const verificationToken = generateVerificationToken();
    const verificationLink = `http://localhost:3000/users/invite/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "You've been invited to join Bones CMS!",
      html: `<p>Please click the following link to finish setting up your account and verify your email:</p>
           <a href="${verificationLink}">Set up your account</a>`,
    };
    const user = new User({ email, role, verificationToken });
    await user.save();

    // Send verification email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        throw new Error("Failed to send email invite");
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    req.flash("success", "Email invite sent!");
    res.redirect("/users/superadmin");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/users/superadmin");
  }
};

module.exports.renderInvite = async (req, res) => {
  try {
    // Update user's account status as verified
    await User.updateOne(
      { email: req.email },
      { $set: { verified: true, verificationToken: "" } }
    );
    req.flash("success", "Email verified successfully!");
    res.render("invite", { email: req.email, success: req.flash("success") });
  } catch (err) {
    console.error("Error updating user:", err);
    req.flash("error", "Email was not successfully verified");
    res.render("invite", { email: req.email, error: req.flash("error") });
  }
};

module.exports.inviteRegister = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await User.findOne({ email });
    user["username"] = username;
    if (!user) {
      throw new Error("Invited user not found!");
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("error", "This username is taken, please choose a new one");
      return res.redirect("/users/invite");
    }
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Bones CMS!");
      res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/");
  }
};
