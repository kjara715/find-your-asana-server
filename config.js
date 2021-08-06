// let DB_URI;

require("dotenv").config();

// if(process.env.NODE_ENV === "test") {
//     DB_URI = "postgresql:///yogadb_test"
// } else {
//     DB_URI="postgresql:///yogadb"
// }

const SECRET_KEY = process.env.SECRET_KEY || "LKIBOG97g*&^%H";
const PORT = +process.env.PORT || 3001;

function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "yogadb_test"
        : process.env.DATABASE_URL || "yogadb";
  }

const BCRYPT_WORK_FACTOR = 12;

console.log("PORT:", PORT.toString());
console.log("BCRYPT_WORK_FACTOR", BCRYPT_WORK_FACTOR);
console.log("Database:", getDatabaseUri());
console.log("---");

module.exports= {
    // DB_URI,
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri
}
