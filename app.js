const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expressHbs = require("express-handlebars"); // 템플릿 엔진마다 사용법이 다르니 문서를 참고하자

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(errorControllers.get404);

app.listen(5000);
