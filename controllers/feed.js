const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

// 함수 내부가 아니라 최상위 레벨에서 사용하는 await는 async 없이도 사용할 수 있다.
// await

exports.getPosts = async (req, res, next) => {
  // pagination
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    // exec()을 사용하면 완전한 Promise를 반환한다. 그러나 기본적으로 mongoose는 Promise와 유사한 object를 반환하기 때문에 사용에는 차이가 없다.
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res
      .status(200)
      .json({ message: "Fetched posts successfully.", posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }

  // Post.find()
  //   .countDocuments()
  //   .then((count) => {
  //     totalItems = count;

  //     return Post.find()
  //       .skip((currentPage - 1) * perPage)
  //       .limit(perPage);
  //   })
  //   .then((posts) => {
  //     res
  //       .status(200)
  //       .json({ message: "Fetched posts successfully.", posts, totalItems });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }

  //     next(err);
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }

  //     next(err);
  //   });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;

    throw error;

    // handle errors manually
    // return res
    //   .status(422)
    //   .json({ message: "Validation failed.", errors: errors.array() });
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;

    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.post.push(post);

      return user.save();
    })
    .then((result) => {
      io.getIO().emit("posts", { action: "create", post });

      res.status(201).json({
        message: "Post is created!",
        post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      // then, catch라는 Promise chain 내부에 있기 때문에 throw를 해도 외부 에러 핸들링 미들웨어로 넘어가지 못한다.
      // throw err;

      // 따라서 next를 사용해서 넘겨준다.
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;

        throw error;
      }

      res.status(200).json({ message: "Post fetched", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;

    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  // 파일 업데이트 로직
  // 기존 파일을 그대로 받아온다.
  let imageUrl = req.body.image;

  // 변경될 파일이 첨부되었을 때만 수정을 진행한다.
  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;

        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorizated!");
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        // DB에 있는 image와 현재 액션에서의 image가 다르다면 변경이 발생한 것이므로 기존 이미지를 삭제함.
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post Updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;

        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorizated!");
        error.statusCode = 403;
        throw error;
      }

      // Check logged user

      clearImage(post.imageUrl);

      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.post.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);

  fs.unlink(filePath, (err) => console.log(err));
};
