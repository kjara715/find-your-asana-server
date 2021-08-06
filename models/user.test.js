const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: true,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("c1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
 

  test("works", async function () {
    let user = await User.register(
      "new", "password", "Test", "Tester", "test@test.com"    
    );
    expect(user).toEqual({
      username: "new",
      firstName: "Test",
      lastName: "Tester",
      email: "test@test.com",
      isAdmin: false
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register(
      "new", "password", "Test", "Tester", "test@test.com", true
    );
    expect(user).toEqual({
      username: "new",
      firstName: "Test",
      lastName: "Tester",
      email: "test@test.com",
      isAdmin: true
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register(
        "new", "password", "Test", "Tester", "test@test.com"  
      );
      await User.register(
        "new", "password", "Test", "Tester", "test@test.com"  
      );
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isAdmin: true,
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
        isAdmin: false,
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: true,
      posts:[{
        id: expect.any(Number),
        caption: 'caption 1',
        media: 'media 1',
        username: 'u1',
        pin: 'Camel',
        pin_id:1
      },
    ],
      bio: null,
      profileImg: 'https://images.pexels.com/photos/2873473/pexels-photo-2873473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewF",
    email: "new@email.com",
    isAdmin: true,
    bio: "Created a bio",
    profileImg: null
  };

  test("works", async function () {
    let job = await User.update("u1", updateData);
    expect(job).toEqual({
      username: "u1",
      ...updateData,
    });
  });


  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})



describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query(
        "SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("create Post", function () {
  test("works", async function () {
    const post = await User.createPost("u1", 
    {caption: "my caption", 
    imgSource: "filler_image_source.jpg",
    pin: "Boat",
    pin_id: 5});

    expect(post).toEqual({
      id: expect.any(Number),
      caption: "my caption", 
      media: "filler_image_source.jpg",
      username: "u1",
      pin: "Boat",
      pin_id: 5
    });
  })

    test("not found if no such user", async function () {
      try {
        await User.createPost("nonexxistentuser",
        {caption: "caption", 
        imgSource: "image.jpg",
        pin: "Plow",
        pin_id: 7}
        );
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
    
  });

  


