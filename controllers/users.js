const User = require("../models/user");
const generateVerificationToken = require("../tokenGenerator");
const transporter = require("../email");
const tokenGenerator = require("../tokenGenerator");
const passport = require("passport");
const LocalStrategy = require("passport-local");

module.exports.renderRegister = (req, res) => {
  res.render("register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "An account is already registered with this email");
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
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
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
        res.redirect("/posts");
      });
    });
  } catch (e) {
    req.flash("error", e.message);
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

    res.send("Email verified successfully!");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.renderForgot = (req, res) => {
  res.render("forgot");
};

module.exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;
    const verificationToken = generateVerificationToken();
    const verificationLink = `http://localhost:3000/users/forgot/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Please click the following link to reset your password:</p>
           <a href="${verificationLink}">Reset Password</a>`,
    };

    // FIX: before this step we need to verify that the account is verified
    await User.updateOne(
      { email: email },
      { $set: { verificationToken: verificationToken } }
    );

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        throw new Error("Failed to send reset password email");
      } else {
        console.log("Email sent: " + info.response);
        req.flash("success", "Reset password email sent!");
        res.redirect("/posts");
      }
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/posts");
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
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = "/posts";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out!");
    const redirectUrl = "/posts";
    res.redirect(redirectUrl);
  });
};
