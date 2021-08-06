const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");



async function commonBeforeAll() {
  
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM posts");


  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          is_admin)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', true),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', false)
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

      await db.query(`
      INSERT INTO posts(caption,
                        media,
                        username,
                        pin,
                        pin_id)
      VALUES ('caption 1', 'media 1', 'u1', 'Camel', 1),
             ('caption 2', 'media 2', 'u2', 'Boat', 2)
      `);

     

       
}

async function createTestPosts(){
  await db.query(`
INSERT INTO posts(caption,
                  media,
                  username,
                  pin,
                  pin_id)
VALUES ('caption 1', 'media 1', 'u1', 'Camel', 1),
       ('caption 2', 'media 2', 'u2', 'Boat', 2)
`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  createTestPosts
 
};