const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").trim().split("=")[1] === "true";

  console.log(req.session.isLoggedIn);

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  // req.session.isLoggedIn = true; // express-session을 활용한 session은 브라우저와 사용자를 식별한다. 다른 브라우저로 접속하면 같은 session을 사용하지 않는다. 유저간 같은 session을 사용하지 않는다.
  // 사용자를 식별하기 위해서 cookie(세션 쿠키)를 사용하지만 중요한 정보는 server-side에 저장된다. 브라우저를 꺼도 남아있으며, 만료되면 사라진다.
  // 즉, 메모리에 저장되는데, 이는 무한이 아니다. 유저가 많으면 쉽게 오버플로우 되겠지?! 보안상으로도 좋지않다. 기능도.
  // 따라서, 메모리 스토어말고 DB 스토어를 사용해서 session을 저장하자. connect-mongo, connect-mongodb-session 등등의 라이브러리!

  User.findById("64c31b59c4e8dee3b91f0760")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;

      // redirect가 session이 db에 저장되는 것보다 먼저 일어나는 것을 방지하기 위해
      // 보통은 이럴 필요가 없지만 순서가 중요하다면 이렇게 처리하자.
      req.session.save((err) => {
        console.log(err);

        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));

  // res.redirect("/"); // redirect는 새로운 요청을 처리하므로, req에 저장한다한들 redirect가 발생하면 유지되지 않음.
};

exports.postLogout = (req, res, next) => {
  // DB에서 session 삭제. 세션 쿠키는 브라우저에 남아있지만 DB에 일치하는 세션이 없기 때문에 의미는 없음.
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
