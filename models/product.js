const fs = require("fs");
const path = require("path");

const Cart = require("./cart");

const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "products.json"
);

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    // 디렉토리가 존재하지 않거나 파일이 없다면 에러가 뜬다.
    // 에러가 없으면 기존에 존재하던 데이터를 파일에서 가져옴.
    if (err) {
      return cb([]);
    }

    cb(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );

        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });

        return;
      }

      this.id = Math.random().toString();

      products.push(this);

      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);

      const updatedProducts = products.filter((prod) => prod.id !== id);

      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  // cb를 호출하면 fetchAll을 호출하는 컨트롤러로 이동하게 되고, fetchAll에 인자로 들어있는 콜백 함수로 넘겨주게 된다.
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);

      cb(product);
    });
  }
};
