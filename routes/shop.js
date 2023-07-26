const path = require("path");
const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const adminData = require("./admin"); // node 서버 상에 저장되어서 전역에 공유됨. 따라서 다른 파일에서 업데이트되면 여기서도 업데이트 됨.

router.get("/", (req, res, next) => {
  // console.log(adminData.products); // admin에서 정의했는데도 업데이트되면 여기서도 볼 수 있음!

  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  const products = adminData.products;
  // template engine을 사용할 때는 res.render()를 사용해서 파일을 표현한다.
  // shop.pug를 입력해도 되지만, 지금 프로젝트는 pug를 기본으로 설정해놨기 때문에 shop만 적어도 된다.
  // res.render("shop", { prods: products, docTitle: "Shop", path: "/" }); // template에 동적인 값들을 전달할 수도 있다!
  res.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
  });
});

module.exports = router;
