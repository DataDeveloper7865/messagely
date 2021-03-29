"use strict";

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
        password,
        first_name,
        last_name, 
        phone,
        join_at,
        last_login_at)
      VALUES 
        ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];

  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(`
      SELECT password
      FROM users
      WHERE username = $1
      `, [username]
    );

    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(`
      UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at
    `, [username])

    const login = result.rows[0]

    if (!login) {
      throw new NotFoundError();
    }

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {

    const result = await db.query(`
      SELECT username, first_name, last_name
      FROM users
      `
    );
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
      SELECT username,
        first_name, 
        last_name,
        phone,
        join_at,
        last_login_at
      FROM users
      WHERE username = $1
      `, [username]
    );

    const user = result.rows[0]

    if (!user) throw new NotFoundError(`No such user: ${user}`);

    return user
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const result = await db.query(`
      SELECT m.id,
        m.to_username,
        m.body,
        m.sent_at,
        m.read_at
      FROM messages AS m
      JOIN users as t ON t.username = m.to_username
      WHERE m.from_user = $1
      `, [username]
    );

    let m = result.rows[0];

    if (!m) throw new NotFoundError(`No such message: ${m}`);

    return result.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const result = await db.query(`
      SELECT m.id,
        m.from_user,
        m.body,
        m.sent_at,
        m.read_at
      FROM messages AS m
      WHERE m.to_user = $1
      `, [username]
    );

    let m = result.rows[0];

    if (!m) throw new NotFoundError(`No such message: ${m}`);

    return result.rows

  }
}


module.exports = User;
