const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const verifyToken = require('../verifyToken')
const users = require('../controllers/users');
const verifyToken = require('../verifyToken');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.get('/verify/:token', verifyToken, users.handleVerifyToken);

router.route('/forgot')
    .get(users.renderForgot)
    .post(users.forgot);

router.get('/forgot/:token', verifyToken, users.renderChangePassword);

router.post('/newpassword', users.newPassword);

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

router.get('/verify/:token', verifyToken, users.verify)

module.exports = router;