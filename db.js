const { Client } = require("pg");
const {getDatabaseUri} = require("./config");

let db;
// new Client({
//     connectionString: DB_URI
// });

if (process.env.NODE_ENV === "production") {
    db = new Client({
      connectionString: getDatabaseUri(),
      ssl: {
        rejectUnauthorized: false
      }
    });
  } else {
    db = new Client({
      connectionString: getDatabaseUri()
    });
  }
  
  db.connect();
  
  module.exports = db;

// db.connect();

module.exports=db;
