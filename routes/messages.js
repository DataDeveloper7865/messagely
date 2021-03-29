"use strict";

const Router = require("express").Router;
const router = new Router();


const { SECRET_KEY } = require("../config");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
 router.get("/:id", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser(res.locals.user);
    let message = Message.get(req.params.id)
    //HOW DO WE GET THE ID OR USERNAME OF CURRENTLY LOGGED IN AND AUTHENTICATED USER
    return res.json({message: message})
})



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
 router.post("/", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser(res.locals.user);
    let body = req.body.body;
    let to_username = req.body.to_username;
    let current_logged_in = res.locals.user;
    let message = Message.create(current_logged_in, to_username, body)
    return res.json({message: message})
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
 router.post("/:id/read", async function(req, res) {
    ensureLoggedIn();
    ensureCorrectUser(res.locals.user);
    let markedMessage = Message.markRead(req.params.id);
    return res.json({message: markedMessage})
})


module.exports = router;