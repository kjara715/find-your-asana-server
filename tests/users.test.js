process.env.NODE_ENV='test';

const request = require('supertest');
const app= require('../app');
const db = require('../db');
const { createToken } = require("../helpers/tokens");
const User = require("../models/user")

// let testUser;

beforeAll(async function() {

    await db.query("DELETE FROM users");

    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
      });

      await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: false,
      });
      await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: false,
      });

      
    
})

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

beforeEach( async function() {
    await db.query("BEGIN")
})

afterEach( async function(){
    await db.query("ROLLBACK")
})

afterAll( async function(){
    await db.end()
})

describe('GET /users', () => {
    test("Get a list of users", async () => {
        const res = await request(app).get('/users')
        .set("authorization", `Bearer ${adminToken}`);;
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({users: [
            {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
              },
              {
                username: "u2",
                firstName: "U2F",
                lastName: "U2L",
                email: "user2@user.com",
                isAdmin: false,
              },
              {
                username: "u3",
                firstName: "U3F",
                lastName: "U3L",
                email: "user3@user.com",
                isAdmin: false,
              },
        ]});
    })

    test("throws a 401 error without a token", async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(401);
       
  })
})

describe('GET /users/:username', () => {
    test("Get one user by username", async () => {
        const res = await request(app).get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user: {
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com",
            isAdmin: false,
            posts: []
          }})
    });

    test("responds with 404 for invalid username", async () => {
        const res = await request(app).get(`/users/nonuser`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(404);
    })

    test("throws a 401 error without a token", async () => {
        const res = await request(app).get(`/users/nonuser`)
        expect(res.statusCode).toBe(401);
       
  })
})

describe('POST /users', () => {
    test("Creates a new user with admin token", async () => {
        const res = await request(app).post('/users')
        .set("authorization", `Bearer ${adminToken}`).send({
            username: "newUser",
            password: "password",
            firstName: "New" ,
            lastName: "User" ,
            email: "newuser@fake.com" ,
            isAdmin: true
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
                user: {
                    
                        username: "newUser",
                        firstName: "New" ,
                        lastName: "User" ,
                        email: "newuser@fake.com",
                        isAdmin: true},
                        token: expect.any(String)
                })  
        })
})

describe('PATCH /users/:userame', () => {
    test("Updates a user", async () => {
        const res = await request(app).patch(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`)
        .send({
            firstName: "NEWU1NAME" ,
            bio: "hi"   
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
                user: {
                    
                        username: "u1",
                        firstName: "NEWU1NAME",
                        lastName: "U1L",
                        email: "user1@user.com",
                        bio: "hi",
                        profileImg: null,
                        isAdmin: false,
                      
                }
            }       
        )  
    })

    test("Responds with 404 for invalid username", async () => {
        const res = await request(app).patch(`/users/nonexistent`)
        .set("authorization", `Bearer ${adminToken}`)
        .send({
            
            first_name: "Test" ,
            last_name: "User" ,
            email: "blah@test.com",
            bio: "UPDATED BIO",
            profile_img:"nothing",
            is_admin: false
        });

        expect(res.statusCode).toBe(404);
         
    })
})

describe('DELETE /users/:username', () => {
    test("Deletes a user for user themself", async () => {
        const res = await request(app).delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: `u1 deleted.`})  
    })

    test("Deletes a user for admins", async () => {
        const res = await request(app).delete(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: `u1 deleted.`})  
    })

    test("Responds with 401 if token is not provided", async () => {
        const res = await request(app).delete(`/users/u1`)
        expect(res.statusCode).toBe(401);
    })

    test("Responds with 401 if token is not from user or admin", async () => {
        const res = await request(app).delete(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`)
        expect(res.statusCode).toBe(401);
    })

    test("responds with 404 for invalid username", async () => {
        const res = await request(app)
        .delete(`/users/nonuser`)
        .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(404);
    })
})

//for ids, which are not present in this table, we can just write our test cases to be id: expect.any(Number)