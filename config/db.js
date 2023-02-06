const mysql = require("mysql");

// db information
const db = mysql.createPool({
  host: "us-cdbr-east-06.cleardb.net",
  user: "bbcbf72b01656b", //mysql의 id
  password: "f69cff64", //mysql의 password
  database: "heroku_c3b4550615fb803", //사용할 데이터베이스
});

module.exports = db;
