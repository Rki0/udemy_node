const path = require("path");
const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

router.get("/", (req, res, next) => {
  // res.send("<h1>hello from express</h1>");

  // html file을 제공하는 방법!
  // './views/shop.html'도 옳지않다! 절대 경로를 써야하기 때문.
  // 그런데 '/views/shop.html' 경로도 옳지않다.
  // 왜?
  // '/'는 운영 체제의 루트 폴더를 나타내기 때문이다. 우리 프로젝트 루트가 아니라.
  // 따라서 path 모듈을 사용한다.
  // 운영 체제의 절대 경로를 이 프로젝트 폴더로 고정해주는 전역 변수 __dirname을 사용!
  // 중요한 점은 '/'를 전혀 사용하지 않는다는 점이다.
  // path.join()은 Linux, window 어디든 작동하는 방식으로 경로를 생성해주기 때문이다.
  // 지금 여기서 dirname은 routes 폴더를 가리킨다. 자신이 사용된 파일의 경로를 알려주기 때문이다.
  // 그런데 views는 routes 폴더의 형제인데요?
  // 이를 해결하기 위해서 상위 경로로 이동하는 '../'를 추가해준다.
  // 물론, /는 mac에서의 경로이기 때문에 ..만 사용할 수도 있다.
  // 아니면, 더욱 더 깔끔하게 만들기 위해서 helper 함수를 작성해서 사용할 수도 있다.
  // res.sendFile(path.join(__dirname, "..", "views", "shop.html"));
  res.sendFile(path.join(rootDir, "views", "shop.html"));
});

module.exports = router;
