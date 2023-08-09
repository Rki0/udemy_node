const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

dotenv.config();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// /images로 향하는 요청을 정적으로 제공할 수 있게 만들어준다.
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message,
    data,
  });
});

mongoose
  .connect(process.env.DB_URL)
  .then((result) => {
    console.log("connect");
    const server = app.listen(5000);
    const io = require("./socket").init(server);

    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
