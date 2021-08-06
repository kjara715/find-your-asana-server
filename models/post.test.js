const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
  } = require("../expressError");
  const db = require("../db.js");
  const Post = require("./post.js");
  const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    createTestPosts
    
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

 



describe("findAll", function () {
    test("works to find all users", async function () {
      const posts = await Post.findAll();
      expect(posts).toEqual([
        {
            id: expect.any(Number),
            caption: 'caption 1',
            username: 'u1',
            media: 'media 1',
            pin: 'Camel',
            pin_id: 1
        },
        {
            id: expect.any(Number),
            caption: 'caption 2',
            username: 'u2',
            media: 'media 2',
            pin: 'Boat',
            pin_id: 2
        }
      ]);
    })

      test("works by passing in pin filter", async function () {
        const posts = await Post.findAll({pin: 'Camel'});
        expect(posts).toEqual([
          {
              id: expect.any(Number),
              caption: 'caption 1',
              username: 'u1',
              media: 'media 1',
              pin: 'Camel',
              pin_id: 1
          }
        ]);
      });
    });
  

  describe("create", function () {
    const newPost = {
        caption: 'new post',
        username: 'u2',
        media: 'new media',
        pin: 'new pin',
        pin_id: 6
    };

    const invalidUserPost = {
        caption: 'nothing',
        username: 'nonexistent',
        media: 'new media',
        pin: 'new pin',
        pin_id: 6
    };

    test("works", async function () {
      let post = await Post.create(newPost);
      expect(post).toEqual({
        id: expect.any(Number),
        caption: 'new post',
        username: 'u2',
        media: 'new media',
        pin: 'new pin',
        pin_id: 6
      });
      const found = await db.query("SELECT * FROM posts WHERE caption = 'new post'");
      expect(found.rows.length).toEqual(1);
      expect(found.rows[0].username).toEqual('u2');
      
    });

    test("bad request for invalid user", async function (){
             try {
              await Post.create(invalidUserPost);
              fail();
            } catch (err) {
              expect(err instanceof NotFoundError).toBeTruthy();
            }
          
    })
  

  });

  describe("get (id)", function () {
    
    test("works --gets a post by id", async function () {
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
        

      let post = await Post.get(postId);
      expect(post).toEqual({
        id: expect.any(Number),
        caption: 'caption 1',
        username: 'u1',
        media: 'media 1',
        pin: 'Camel',
        pin_id: 1
      });
      
    });

    test("not found error for invalid id", async function (){
             try {
              await Post.get(190903);
              fail();
            } catch (err) {
              expect(err instanceof NotFoundError).toBeTruthy();
            }
          
    })
})

describe("Delete", function () {
    
    test("works: deletes a post by id and username for owner", async function () {
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
        

       await Post.deletePost(postId, 'u1');

       let deleted= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
       expect(deleted.rows.length).toBe(0)
      
      
    });

    test("works: deletes a post by id and username for admin (nonowner)", async function (){
        
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [2]);
        let postId=res.rows[0].id
        

       await Post.deletePost(postId, 'u1');

       let deleted= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [2]);
       expect(deleted.rows.length).toBe(0)
        
    })

    test("Not found error for invalid id", async function (){
             try {
              await Post.deletePost(19090390, 'u1');
              fail();
            } catch (err) {
              expect(err instanceof NotFoundError).toBeTruthy();
            }
          
    });

    test("Not found error for invalid username", async function (){
        try {
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
         await Post.deletePost(postId, 'nonexistent');
         fail();
       } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
       }
    })

    test("Unauthorized if not admin or owner of post", async function (){
        try {let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
         await Post.deletePost(postId, 'u2');
         fail();
       } catch (err) {
         expect(err instanceof UnauthorizedError).toBeTruthy();
       }
    })

    
     
})

describe("Update", function () {
    
    test("works: deletes a post by id and username for owner", async function () {
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
        

       let post =await Post.updatePost(postId, 'u1', {caption: "new caption!!!"});

       expect(post).toEqual({
        id: expect.any(Number),
        caption: 'new caption!!!',
        username: 'u1',
        media: 'media 1',
        pin: 'Camel',
        pin_id: 1}
    )
      
      
    });

    test("works: deletes a post by id and username for admin (nonowner)", async function (){
        
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [2]);
        let postId=res.rows[0].id
        

      let post = await Post.updatePost(postId, 'u1', {caption: "updated by an admin for u2's post", pin: "Changed pin too."});

      expect(post).toEqual( {
        id: expect.any(Number),
        caption: "updated by an admin for u2's post",
        username: 'u2',
        media: 'media 2',
        pin: "Changed pin too." ,
        pin_id: 2
    })
        
    })

    test("Not found error for invalid id", async function (){
             try {
              await Post.updatePost(121212, 'u1', {caption: "fails because bad id"});
              fail();
            } catch (err) {
              expect(err instanceof NotFoundError).toBeTruthy();
            }
          
    });

    test("Not found error for invalid username", async function (){
        try {
        let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
         await Post.updatePost(postId, 'nonexistent', {caption: "fails because nonexistent user"});
         fail();
       } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
       }
    })

    test("Unauthorized if not admin or owner of post", async function (){
        try {let res= await db.query(`SELECT id FROM posts WHERE pin_id=$1`, [1]);
        let postId=res.rows[0].id
         await Post.updatePost(postId, 'u2', {caption: "I am not an admin (u2) trying to update u1's post"});
         fail();
       } catch (err) {
         expect(err instanceof UnauthorizedError).toBeTruthy();
       }
    })

    
     
})



    

  