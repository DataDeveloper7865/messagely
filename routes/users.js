"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  authenticateJWT,
} = require("../middleware/auth");
const { SECRET_KEY } = require("../config");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function(req, res) {
    ensureLoggedIn();
    let users = User.all()
    return res.json({users: users})
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
 router.get("/:username", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser(req.params.username);
    let user = User.get(req.params.username)
    return res.json({user: user})
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get("/:username/to", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser();
    let messages = User.messagesTo(req.params.username)
    return res.json({messages: messages})
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get("/:username/from", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser();
    let messages = User.messagesFrom(req.params.username)
    return res.json({messages: messages})
})


module.exports = router;