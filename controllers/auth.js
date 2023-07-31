const crypto = require("crypto"); // express 내장 라이브러리
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

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
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  // req.session.isLoggedIn = true; // express-session을 활용한 session은 브라우저와 사용자를 식별한다. 다른 브라우저로 접속하면 같은 session을 사용하지 않는다. 유저간 같은 session을 사용하지 않는다.
  // 사용자를 식별하기 위해서 cookie(세션 쿠키)를 사용하지만 중요한 정보는 server-side에 저장된다. 브라우저를 꺼도 남아있으며, 만료되면 사라진다.
  // 즉, 메모리에 저장되는데, 이는 무한이 아니다. 유저가 많으면 쉽게 오버플로우 되겠지?! 보안상으로도 좋지않다. 기능도.
  // 따라서, 메모리 스토어말고 DB 스토어를 사용해서 session을 저장하자. connect-mongo, connect-mongodb-session 등등의 라이브러리!

  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Log In",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

  // 꽤나 시간이 걸리므로, 가장 나중에 얘를 실행하던지, redirect 후 얘를 실행하던지 하는게 좋을듯. await 대신 return으로 ㅇㅇ.
  // await transporter
  //   .sendMail({
  //     from: `"Udemy Node.js Study" <${process.env.NODEMAILER_USER}>`,
  //     to: process.env.NODEMAILER_USER,
  //     subject: "This is test email from node.js server.",
  //     text: "This is text",
  //     html: "<h1>This is HTML</h1>",
  //   })
  //   .then(() => {
  //     console.log("email is sent.");
  //   })
  //   .catch((err) => console.log(err));

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Log In",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email,
            password,
          },
          validationErrors: [],
        });
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

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Log In",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email,
              password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      // res.redirect("/500");

      const error = new Error(err);

      error.httpStatusCode = 500;
      return next(error); // express가 error를 next로 받는 경우, 모든 미들웨어를 건너 뛰고 오류 처리 미들웨어로 이동함.
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // rotuer에 등록한 check 미들웨어에서 수집된 에러를 모아놓는 validationResult
  const errors = validationResult(req);

  // validation failed
  if (!errors.isEmpty()) {
    console.log(errors.array());
    // 유효성 검사 실패 에러 422
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
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

exports.getRest = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

// 비밀번호 재발급 이메일 보내기~
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex"); // buffer가 16진수를 저장하므로 hex를 입력해서 전환해줘야한다.

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email.");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");

        // a 태그로 이동하는 링크의 token을 통해 우리가 보낸 메일이라는 것을 확인할 것이다!
        transporter.sendMail({
          from: `"Udemy Node.js Study" <${process.env.NODEMAILER_USER}>`,
          to: process.env.NODEMAILER_USER,
          subject: "Password Reset.",
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href='http://localhost:5000/reset/${token}'>link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  // 이메일에 첨부한 링크의 파라미터로 들어있던 token을 가져온다.
  const token = req.params.token;

  // 토큰이 있는지 확인하고 유효 기간을 검증한다.
  // $gt는 greater than이라는 뜻으로 현재 시간보다 높은지를 묻는 용도.
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      // res.redirect("/500");

      const error = new Error(err);

      error.httpStatusCode = 500;
      return next(error); // express가 error를 next로 받는 경우, 모든 미들웨어를 건너 뛰고 오류 처리 미들웨어로 이동함.
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      // DB에 key가 남아있을 필요가 없으므로 undefined 처리
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
