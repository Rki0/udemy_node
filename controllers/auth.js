const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  // req.session.isLoggedIn = true; // express-session을 활용한 session은 브라우저와 사용자를 식별한다. 다른 브라우저로 접속하면 같은 session을 사용하지 않는다. 유저간 같은 session을 사용하지 않는다.
  // 사용자를 식별하기 위해서 cookie(세션 쿠키)를 사용하지만 중요한 정보는 server-side에 저장된다. 브라우저를 꺼도 남아있으며, 만료되면 사라진다.
  // 즉, 메모리에 저장되는데, 이는 무한이 아니다. 유저가 많으면 쉽게 오버플로우 되겠지?! 보안상으로도 좋지않다. 기능도.
  // 따라서, 메모리 스토어말고 DB 스토어를 사용해서 session을 저장하자. connect-mongo, connect-mongodb-session 등등의 라이브러리!

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");

        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }

          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "E-Mail exists already.");
        return res.redirect("/login");
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  // DB에서 session 삭제. 세션 쿠키는 브라우저에 남아있지만 DB에 일치하는 세션이 없기 때문에 의미는 없음.
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
