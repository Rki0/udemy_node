const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

// // 미들웨어를 추가할 수 있게 해주는 use()
// // 미들웨어는 req, res, next라는 3개의 인자를 받는다.
// app.use((req, res, next) => {
//   console.log("in the middleware!");

//   // 모든 미들웨어를 거쳐 위에서 아래로 흐르는 작업을 하는데
//   // 다음 미들웨어로 넘겨주기 위한 작업이다.
//   // next를 호출하지 않으면 res을 보내야지만 이동이 된다.
//   next(); // Allows the req to continue to the next middlewares in line
// });

// app.use((req, res, next) => {
//   console.log("in another middleware!");

//   // express의 기본 응답 헤더는 text/html이다. 언제든 이를 무시하고 설정할 수 있다.
//   // res는 응답을 보내기 때문에 다음 미들웨어로 가지 않는다.
//   res.send("<h1>hello from express</h1>");
// });

app.use(bodyParser.urlencoded({ extended: false }));

// route를 통하지않고 정적으로 파일을 서비스하기 위한 작업
// 예를 들어, css 파일을 html에 link하기 위한, 이미지를 제공하기 위한.
// 읽기 전용 권한을 주고 싶은 파일을 입력하자! 그러면 url 검색으로도 접근할 수 있다.
// public 폴더는 보통 유저도 볼 수 있는 것들을 넣는다.
// public만 연결하면 에러가 뜬다.
// html 쪽에서 public에 이미 연결되어 있다고 생각하고 작성해줘야한다.
// public/css/main.css => /css/main.css
// express가 그렇게 동작하기 때문이다. 파일명만 작성하면 .js를 자동으로 붙여주듯,
// 파일을 탐색할 때 자동으로 public 폴더로 forwarding을 해주기 때문!!
app.use(express.static(path.join(__dirname, "public")));

// app.use("/add-product", (req, res, next) => {
//   res.send(
//     "<form action='/product' method='POST'><input type='text' name='title' /><button type='submit'>Add Product</button></form>"
//   );

//   // res를 send한 뒤에는 next를 쓰지않는게 좋다. 다른 응답 관련 코드를 실행하면 안 되기 때문.
// });

// // 만약 여기서 get을 사용했다면 위의 form에서 POST를 사용했기 때문에 넘어오지 않고 끝남.
// app.post("/product", (req, res, next) => {
//   console.log(req.body); // body-parser 없이 req.body에 접근하면 undefined만 뜬다.

//   res.redirect("/");
// });

app.use("/admin", adminRoutes); // routes/admin에서 보내느 route 객체를 사용하겠다는 뜻

// app.use((req, res, next) => {
//   res.send("<h1>hello from express</h1>");
// });

app.use(shopRoutes);

// 잘못된 요청을 처리하기 위한 404 안내
// 어차피 다른 경로를 못찾고 내려온 것이기 때문에 '/'를 써도되고 안 써도 됨.
app.use((req, res, next) => {
  // send가 마지막에 오기만하면 그 앞에서 setHeader든 뭐든 가능.
  // res.status(404).send("<h1>Page not found</h1>");
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// express는 listen을 통해 http.createServer 기능을 제공한다.
app.listen(5000);
