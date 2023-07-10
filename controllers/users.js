const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        const registeredUser = await User.register(user, password);
        // login user after registration using passport helper method
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

module.exports.renderChangePassword = (req, res) => {
    res.render('changePassword', { username: req.username });
}

// FIX THIS
module.exports.newPassword = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('register');
        }

        // Set the new password using Passport's setPassword method
        await user.setPassword(password);

        await user.save();

        res.send('Password was reset!');
        // req.flash('success', 'Password updated successfully');
        // res.redirect('/users/login');
    } catch (err) {
        // req.flash('error', err.message);
        res.redirect('register');
    }
};


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