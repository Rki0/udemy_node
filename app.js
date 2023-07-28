const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자
const mongoose = require("mongoose");
const dotev = require("dotenv");

dotev.config();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64c31b59c4e8dee3b91f0760")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorControllers.get404);

mongoose
  .connect(
    `mongodb+srv://pky00823:${process.env.DB_PASSWORD}@cluster0.cqkdk1n.mongodb.net/shop?retryWrites=true`
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Ki",
          email: "test@test.com",
          cart: {
            items: [],
          },
        });

        user.save();
      }
    });

    app.listen(5000);
    console.log("Connected");
  })
  .catch((err) => console.log(err));
