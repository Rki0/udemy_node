const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자
const mongoose = require("mongoose");
const dotev = require("dotenv");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

dotev.config();

const MONGODB_URI = `mongodb+srv://pky00823:${process.env.DB_PASSWORD}@cluster0.cqkdk1n.mongodb.net/shop?retryWrites=true`;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorControllers = require("./controllers/error");
const User = require("./models/user");

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// get 이외의 데이터를 변경하는 모든 요청에 대해 뷰에 csrf 토큰이 있는지 확인한다.
app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  // res.locals를 사용하면 view에 입력할 로컬 변수를 설정할 수 있게 된다.
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// mongoDB session store는 mongoose 모델을 이해할 수 없기 때문에 처리를 해줘야함.
app.use((req, res, next) => {
  // 로그아웃 상태라면 user 정보가 없기 때문에 next로 넘김
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      // 만약 비동기식 코드인 then, catch 내부애서 throw가 된다면 아래에 있는 에러 핸들링(500 등)에 도달하지 않는다.
      // 따라서 next로 에러를 넘겨준다.
      // throw new Error(err);
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorControllers.get500);
app.use(errorControllers.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render('/500');
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(5000);
    console.log("Connected");
  })
  .catch((err) => console.log(err));
