const mongoose = require('mongoose');
const User = require('./models/user');

const verifyToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verify the token against the stored value in MongoDB using the User model
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.send('Invalid token');
    }

    // Attach the user object to the request for further processing in the route handler
    req.username = user.username;
    console.log('Found user with token')
    next();
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error verifying token:', error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = verifyToken