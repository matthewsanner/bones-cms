const crypto = require('crypto');

const generateVerificationToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = generateVerificationToken;