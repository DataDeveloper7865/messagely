"use strict";
const User = require("../models/user");
const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  authenticateJWT,
} = require("../middleware/auth");
const { SECRET_KEY } = require("../config");

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res) {
  const { username, password } = req.body;
  let isValidUser = await User.authenticate(username, password);
  console.log(isValidUser);
  if (isValidUser) {
    User.updateLoginTimestamp(username);
    let token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new BadRequestError();
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res) {
  let user = await User.register(req.body);

  let token = jwt.sign({ username: user.username }, SECRET_KEY);

  return res.json({ token });
});

module.exports = router;
