const { body, validationResult } = require("express-validator");

// Order Validation Schema
const orderValidationSchema = [
  body("product_id")
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid product ID"),

  body("charity_id")
    .notEmpty().withMessage("Charity ID is required")

    .isMongoId().withMessage("Invalid charity ID"),

  body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("amount")
    .notEmpty().withMessage("amount is required")
    .isFloat({ min: 0 }).withMessage("Amount must be a positive number"),

  body("status")
    .optional()
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
];
function validateOrder(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      status: "Failed",
      message: result.array()[0].msg,
    });
  }
  next();
}

module.exports = { orderValidationSchema, validateOrder };
