const User = require('../models/user');
const token = require("../utilities/verificationToken");
const sendVerificationEmail = require('../utilities/sendEmail.js')
const nodemailer = require('nodemailer');

module.exports.renderRegister = (req, res) => {
    res.render('register');
}

module.exports.register = async (req, res, next) => {
  try {
    
    const { username, email, password } = req.body;

    const user = new User({ username, email, token });
    const registeredUser = await User.register(user, password);

    sendVerificationEmail(email, token);

    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Bones CMS!');
      res.redirect('/posts');
    })

  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register')
  }
}

module.exports.renderLogin = (req, res) => {
  res.render('login');
}

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = '/posts';
  res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged out!');
    const redirectUrl = '/posts';
    res.redirect(redirectUrl);
  })
}

module.exports.verify = async (req, res) => {
  console.log("hit verify in controller");
  try {
    const username = req.username;
    await User.updateOne({ username: username }, { $set: { verified: true },  $unset: { verificationToken: 1 } });
    res.send('Email verified successfully');

  } catch(error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
};