const db = require('../db');
const {NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ExpressError}= require('../expressError');
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require('../config');
const { sqlForPartialUpdate } = require("../helpers/sql");

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];
    //

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");

  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      username, password, firstName, lastName, email, isAdmin = false ) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }
    
 
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
  
    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin",
                  bio,
                  profile_img AS "profileImg"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userPostsRes = await db.query(
          `SELECT *
           FROM posts
           WHERE posts.username = $1`, [username]);

    user.posts = userPostsRes.rows.map(p => {
      const id = p.id;
      const caption = p.caption;
      const media=p.media;
      const pin=p.pin;
      const pin_id=p.pin_id;
      const username=p.username
      
      return {
        id,
        caption,
        media,
        pin,
        pin_id,
        username
      }
    });

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin, bio, profile_img }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    
    const checkUser = await db.query(
      `SELECT *
       FROM users
       WHERE username = $1`, [username]);

    const user1 = checkUser.rows[0];

    if (!user1) throw new NotFoundError(`No user: ${username}`);

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
          profileImg: "profile_img"
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                bio,
                                profile_img AS "profileImg",
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  

  static async createPost(username, {caption, imgSource, pin, pin_id}) {
    
   
    const checkUser = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`, [username]);
    const user = checkUser.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    const result = await db.query(
          `INSERT INTO posts (caption, media, username, pin, pin_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, caption, media, username, pin, pin_id`,
        [caption, imgSource, username, pin, pin_id]);

      const post=result.rows[0]
      return post 
  }

  

}


module.exports = User;