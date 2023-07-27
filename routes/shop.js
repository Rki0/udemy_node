const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// 동적 세그먼트를 사용하기 때문에 라우트 설정할 때 순서가 중요함.
// products/delete를 얘보다 아래에 넣으면 delete가 :productId가 되어버려서 비정상 동작을 할 수도 있다는 뜻!
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

router.get("/checkout", shopController.getCheckout);

module.exports = router;
