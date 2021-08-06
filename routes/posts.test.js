"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./__testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


//GET /posts

describe("GET /posts", function () {
    test("works for anyone", async function () {
      const resp = await request(app)
          .get("/posts")
      expect(resp.body).toEqual({
        posts: [
          {
            id: expect.any(Number),
            caption: "1st caption",
            media:"imgSource 1",
            pin: "pin 1",
            pin_id: 1,
            username: 'u1'
          },
          {
            id: expect.any(Number),
            caption: "2nd caption",
            media:"imgSource 2",
            pin: "pin 2",
            pin_id: 2,
            username: 'u1'

          },
          {
            id: expect.any(Number),
            caption: "3rd caption",
            media:"imgSource 3",
            pin: "pin 3",
            pin_id: 3,
            username: 'u2'

          },

           {
            id: expect.any(Number),
            caption: "4th caption",
            media:"imgSource 4",
            pin: "pin 4",
            pin_id: 4,
            username: 'u3'

          },
        ],
      });
    });
  
    
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE posts CASCADE");
      const resp = await request(app)
          .get("/posts")
      expect(resp.statusCode).toEqual(500);
    });
  });

//GET /posts/:id

describe("GET /posts/:id", function () {
    test("works for anyone", async function () {
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='3rd caption'`);
        const postId=myRes.rows[0].id
        const resp = await request(app)
          .get(`/posts/${postId}`)
      expect(resp.body).toEqual({
          post: {
            id: expect.any(Number),
            caption: "3rd caption",
            media:"imgSource 3",
            pin: "pin 3",
            pin_id: 3,
            username: 'u2'
          },
        })
      })
  
    test("not found error if post not found", async function () {
      const resp = await request(app)
          .get(`/posts/123123123`)
      expect(resp.statusCode).toEqual(404);
    });
  });

//POST /posts

describe("POST /posts/:username", function () {
    test("works for admins", async function () {
      const resp = await request(app).post(`/posts/u1`)
          .send({
            username: "u1",
            caption: "new caption",
            media:"insert media",
            pin: "random pin",
            pin_id: 9
            
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        post: {
          id: expect.any(Number),
          username: "u1",
          caption: "new caption",
          media:"insert media",
          pin: "random pin",
          pin_id: 9
          
        },
      });
    });

  
    test("works for same user", async function () {
        
        const resp = await request(app).post(`/posts/u1`)
        .send({
          username: "u1",
          caption: "new caption",
          media:"insert media",
          pin: "random pin",
          pin_id: 9
          
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      post: {
        id: expect.any(Number),
        username: "u1",
        caption: "new caption",
        media:"insert media",
        pin: "random pin",
        pin_id: 9
        
      },
    });
  })

  test("unauth for other users", async function () {
    const resp = await request(app).post(`/posts/u1`)
        .send({
          username: "u1",
          caption: "new caption",
          media:"insert media",
          pin: "random pin",
          pin_id: 9
          
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post(`/posts/u1`)
        .send({
          username: "u1",
          caption: "new caption",
          media:"insert media",
          pin: "random pin",
          pin_id: 9
          
        })
        
    expect(resp.statusCode).toEqual(401);
  })
})

//DELETE /posts

describe("DELETE /posts/:username/:id", function () {
    test("works for admins", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).delete(`/posts/u1/${postId}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        Deleted: `Post id = ${postId}`
      });
    });

    test("works for same user", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).delete(`/posts/u1/${postId}`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        Deleted: `Post id = ${postId}`
      });
    });

    test("unauth for other users (nonadmins)", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).delete(`/posts/u1/${postId}`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
      
    });

    test("unauth for anon", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).delete(`/posts/u1/${postId}`)
      expect(resp.statusCode).toEqual(401);
      
    });

})

//PATCH /posts/:username/:id

describe("PATCH /posts/:username/:id", function () {
    
    test("works for admins", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).patch(`/posts/u1/${postId}`)
          .send({
            caption: "I updated the caption",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        post: {
          id: expect.any(Number),
          username: "u1",
          caption: "I updated the caption",
          media:"imgSource 1",
          pin: "pin 1",
          pin_id: 1
          
        },
      });
    });

    test("works for same user", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).patch(`/posts/u1/${postId}`)
          .send({
            caption: "I updated the caption",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        post: {
          id: expect.any(Number),
          username: "u1",
          caption: "I updated the caption",
          media:"imgSource 1",
          pin: "pin 1",
          pin_id: 1
          
        },
      });
    });

    test("unauth for other users", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).patch(`/posts/u1/${postId}`)
          .send({
            caption: "I updated the caption",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
      
    });

    test("unauth for anon", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).patch(`/posts/u1/${postId}`)
          .send({
            caption: "I updated the caption",
          })
         
      expect(resp.statusCode).toEqual(401);
      
    });

    test("Bad request for invalid data", async function () {
        //need to query the id
        const myRes = await db.query(`SELECT id FROM posts WHERE caption='1st caption'`);
        const postId = myRes.rows[0].id
      const resp = await request(app).patch(`/posts/u1/${postId}`)
          .send({
            caption: "I updated the caption",
            media: "changing the media"
          })
          .set("authorization", `Bearer ${adminToken}`);
          expect(resp.statusCode).toEqual(400);
    });
})