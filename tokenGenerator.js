const crypto = require('crypto');

function generateVerificationToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = generateVerificationToken;