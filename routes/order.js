const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { orderValidationSchema, validateOrder } = require("../middlewares/order");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrdersByCharity
} = require("../controllers/order");

router.post("/", authenticateUser, orderValidationSchema, validateOrder, createOrder);
router.get("/", authenticateUser, getUserOrders);
router.get("/:id", authenticateUser, getOrderById);
router.get("/charity/:charityID", authenticateUser, getOrdersByCharity);

module.exports = router;