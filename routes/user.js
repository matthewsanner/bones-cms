const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const users = require("../controllers/users");
const verifyToken = require("../verifyToken");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.get("/verify/:token", verifyToken, users.handleVerifyToken);

router.route("/forgot").get(users.renderForgot).post(users.forgot);

router.get("/forgot/:token", verifyToken, users.renderChangePassword);

router.post("/newpassword", users.newPassword);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/users/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

router.post("/superadmin/invite", users.inviteUser);

router.get("/superadmin", users.renderSuperadmin);

router.get("/invite/:token", verifyToken, users.renderInvite);

router.post("/invite", users.inviteRegister);

module.exports = router;
