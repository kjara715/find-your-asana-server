const db = require("../db");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Post {
  

  static async create({ caption, media=null, username, pin=null, pin_id }) {

    const checkUser = await db.query(
      `SELECT *
       FROM users
       WHERE username = $1`, [username]);
    const user = checkUser.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);
    
    
    const result = await db.query(
          `INSERT INTO posts
           (caption, media, username, pin, pin_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, caption, media, username, pin, pin_id`,
        [
          caption,
          media,
          username,
          pin, 
          pin_id
        ],
    );

   
    const post = result.rows[0];

    return post;
  }

  static async findAll(searchFilters = {}) {
    

    let query = 
      `SELECT id, caption, media, pin, pin_id, username
                 FROM posts`;

    let whereExpressions =[];
    let queryValues = [];
    
    const { pin } = searchFilters;

    if (pin) {
      queryValues.push(`${pin}`);
      whereExpressions.push(`pin = $${queryValues.length}`);
      query += ` WHERE ${whereExpressions.join(" ")}`
    }

  
    const results = await db.query(query, queryValues);
    const posts=results.rows

    return posts

   
  }


  static async get(id) {
    const postRes = await db.query(
          `SELECT *
           FROM posts
           WHERE id = $1`,
        [id]);

    const post = postRes.rows[0];

    if (!post) throw new NotFoundError(`No post with id of ${id}`);

    return post;
  }


static async deletePost(id, username){
//check to see if the username passed in owns that post id OR if the user is an admin
//first check if the post exists

const checkPost = await db.query(
  `SELECT username
   FROM posts
   WHERE  id = $1
   `, [id]);
const foundPost = checkPost.rows[0];

if (!foundPost) throw new NotFoundError(`No post with id: ${id}`);

//get user info to see if this user is an admin 
const checkUser = await db.query(
  `SELECT username,
          is_admin AS "isAdmin"
   FROM users
   WHERE username= $1`,
   [username]
);

const foundUser=checkUser.rows[0]

if (!foundUser) throw new NotFoundError(`No user with username: ${username}`);


if(foundPost.username !== username && !foundUser.isAdmin) throw new UnauthorizedError("You do not have permission to delete this post.")

await db.query(
      `DELETE
       FROM posts
       WHERE id = $1
       `,
    [id],
);


  }

  static async updatePost(id, username, data) {
    
    const checkPost = await db.query(
          `SELECT *
           FROM posts
           WHERE  id = $1`, [id]);
    const foundPost = checkPost.rows[0];

    if (!foundPost) throw new NotFoundError(`No post with id: ${id}`);

    const checkUser = await db.query(
      `SELECT username,
              is_admin AS "isAdmin"
       FROM users
       WHERE username= $1`,
       [username]
    );

    const foundUser=checkUser.rows[0]

    if (!foundUser) throw new NotFoundError(`No user with username: ${username}`);

    if(foundPost.username !== username && !foundUser.isAdmin) throw new UnauthorizedError("You do not have permission to edit this post.")

    const { setCols, values } = sqlForPartialUpdate(
      data, {
          caption: "caption",
          media: "media",
          pin: "pin",
          pin_id: "pin_id"
      });
  const idVarIdx = "$" + (values.length + 1);
  const querySql = `UPDATE posts 
                    SET ${setCols} 
                    WHERE id = ${idVarIdx} 
                    RETURNING
                    id,
                    caption,
                    media,
                    pin,
                    pin_id,
                    username`;

  const result = await db.query(querySql, [...values, id]);
  const post = result.rows[0];
  

  
  return post;

    
  }

 
}


module.exports = Post;
