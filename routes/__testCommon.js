const db = require("../db.js");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM posts");
    // noinspection SqlWithoutWhere
  
    //to register put in username, password, firstNme, lastName, email, isAdmin (in this order)
    await User.register(
       "u1", "password1", "U1F", "U1L", "user1@user.com"
    );
    await User.register(
      "u2", "password2", "U2F", "U2L", "user2@user.com"
      
    );
    await User.register(
      "u3", "password3", "U3F", "U3L", "user3@user.com"
    );

    await User.createPost("u1", {
      caption: "1st caption",
      imgSource:"imgSource 1",
      pin: "pin 1",
      pin_id: 1
    })

    await User.createPost("u1", {
      caption: "2nd caption",
      imgSource:"imgSource 2",
      pin: "pin 2",
      pin_id: 2
    })

    await User.createPost("u2", {
      caption: "3rd caption",
      imgSource:"imgSource 3",
      pin: "pin 3",
      pin_id: 3
    })

    await User.createPost("u3", {
      caption: "4th caption",
      imgSource:"imgSource 4",
      pin: "pin 4",
      pin_id: 4
    })
  
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
  
  
  const u1Token = createToken({ username: "u1", isAdmin: false });
  const u2Token = createToken({ username: "u2", isAdmin: false });
  const adminToken = createToken({ username: "admin", isAdmin: true });
  
  
  module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
  };