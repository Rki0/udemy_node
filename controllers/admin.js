const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // app.js에서 모델간 관계 정의할 때 User에 Product를 묶어놨기 때문에 create + product를 user에서 사용할 수 있다.
  req.user
    .createProduct({
      title,
      price,
      imageUrl,
      description,
    })
    // Product.create({
    //   title,
    //   price,
    //   imageUrl,
    //   description,
    //   // 이렇게 수동으로 user id를 등록해줄 수도 있지만, sequelize 기능을 사용할 수도 있다.
    //   // userId: req.user.id,
    // })
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  // app.js에서 정의한 sequelize의 모델간 정의에 따라 findByPk가 아닌 get + product로도 같은 기능을 수행할 수 있다.
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];

      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
      });
    })
    .catch((err) => console.log(err));

  // Product.findByPk(prodId)
  // .then((product) => {
  //   if (!product) {
  //     return res.redirect("/");
  //   }

  //   res.render("admin/edit-product", {
  //     pageTitle: "Edit Product",
  //     path: "/admin/edit-product",
  //     editing: editMode,
  //     product,
  //   });
  // })
  // .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;

  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

      return product.save();
    })
    .then((result) => {
      console.log("Updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    // Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("Destroyed product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
