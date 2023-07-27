const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

// use는 미들웨어를 등록할 뿐이다.
// user를 검색하고 req.user에 등록하기 위한 작업
// req.user는 sequelize를 사용할 수 있는 특수한 객체가 들어와있다는 점!
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;

      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorControllers.get404);

// 모델 관계 정의도 sequelize로 할 수 있다!!!
// Product가 User에 속한다. 즉, 사용자가 이 제품을 생성했다는 뜻.
// 설정을 통해 관계를 더 명확하게 표현할 수 있다. onDelete의 CASCADE는 User를 삭제할 경우 Prodcut도 삭제되도록 만들어준다.
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// User가 많은 수의 product를 가질 수 있다.
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// sync()를 통해 테이블도 생성하고 관계도 생성
// 기존 테이블을 덮어쓰지 않는다. 없으면 만들고, 있으면 안 만드는.
sequelize
  // .sync({ force: true }) // force는 실행할 때마다 모든 것을 덮어씌우므로(초기화) dev 단계에서만 사용하고 prod에서는 사용 안하는 걸로..?
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      User.create({ name: "Kiyoung", email: "test@test.com" });
    }

    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
