const mongodb = require("mongodb");
const dotenv = require("dotenv");
const MongoClient = mongodb.MongoClient;

dotenv.config();

// 파일 내에서만 쓰일 거라는 것을 암시하는 _, 그냥 그렇다고~
let _db;

// 이 방법은 매번 연견을 만들 뿐만 아니라, 종료할 수도 없기 때문에 좋은 방법이 아니다.
const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://pky00823:${process.env.DB_PASSWORD}@cluster0.cqkdk1n.mongodb.net/shop?retryWrites=true`
  )
    .then((client) => {
      console.log("Connected!");

      _db = client.db();

      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// 연결되어 있는 DB 인스턴스를 반환하는 함수
const getDb = () => {
  if (_db) {
    return _db;
  }

  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
