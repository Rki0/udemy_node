const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;

    // constructor에서 this._id에 new ~ 처리를 해놔서 id가 들어오지 않은 상황에서도 생성이 되버리는 바람에 이 부분이 true로 작동함
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }

    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();

    // find()는 promise 대신 커서를 반환한다. 커서는 mongoDB에서 제공하는 객체로 단계별로 요소와 문서를 탐색한다.
    // toArray()를 통해 JS 객체로 변경시킨다. 이는 수십~수백 개 정도되는 데이터를 다룰 때 쓰는게 좋다. 아니면 그냥 페이지네이션을 구현하는게 좋음.
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();

    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) }) // ObjectId로 반환되기 때문에 _id를 string으로 활용하기 위해서 다음과 같은 처리를 해줘야함.
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    db.collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then(() => {
        console.log("Deleted!");
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
