const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

// app.engine()을 통해 내장되어있지 않은 새로운 엔진을 등록할 수 있다.
// pug는 express 내장임.
// 엔진 이름은 겹치면 안됨
// 여기서 설정한 이름은 확장자로 사용된다.
// 예를들어, hbs로 설정하면 handlebars를 사용하는 파일의 확장자는 .hbs로 사용할 수 있다.
// 같은 이유로 pug 또한 .pug로 사용되고 있었던 것이다.
// 편의상 hbs로 사용
// app.engine(
//   "hbs",
//   expressHbs({ layoutsDir: "views/layouts", defaultLayout: "main-layout.hbs" })
// );

// set은 global configuration value를 설정할 수 있게 해준다.
// app.get을 통해 사용할 수 있다.
// view engine을 설정할 수 있다!
// view engine의 value는 설정한 값과 동일하게 작성해줘야한다.
app.set("view engine", "ejs");
// app.set("view engine", "pug");
app.set("views", "views"); // views 속성 값은 기본으로 views 폴더를 가리키도록 설정되어 있으므로 적을 필요는 없지만, 다른 폴더에 view 담당을 만들어놨다면 설정해줘야함.

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes.routes);

app.use(shopRoutes);

app.use((req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "" });
});

app.listen(5000);
