const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const {addressValidationSchema, validateAddress }=require("../middlewares/address")

const {
  createAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address");


router.post("/", authenticateUser, addressValidationSchema, validateAddress, createAddress);
router.get("/", authenticateUser, getAddress);
router.put("/:id", authenticateUser, updateAddress);
router.delete("/:id", authenticateUser, deleteAddress);

module.exports = router;
