const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64c23304252735a1408a0e93")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorControllers.get404);

// MongoDB는 BSON이라는 데이터 타입을 쓴다. 이진 JSON. _id가 ObjectId로 저장되고, 반환되는 이유.
mongoConnect((client) => {
  app.listen(5000);
});
