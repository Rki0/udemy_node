// const mysql = require("mysql2");

const dotenv = require("dotenv");

dotenv.config();

// // connection을 사용하는 방법과 pool을 사용하는 방법이 있는데
// // 전자는 쿼리 실행마다 연결을 했다가 끊었다가 하는 것이고, 후자는 지속적으로 연결시켜놓는 것이다.
// // 쿼리가 실행되면 풀을 사용했다가 끝나면 다른 쿼리가 사용할 수 있게 풀을 돌려주는 방식. 풀은 애플리케이션이 종료될 때 종료.
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "udemy_node",
//   password: process.env.DB_PASSWORD,
// });

// module.exports = pool.promise();

const Sequelize = require("sequelize");

const sequelize = new Sequelize("udemy_node", "root", process.env.DB_PASSWORD, {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
