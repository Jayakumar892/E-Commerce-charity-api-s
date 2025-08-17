const { body, validationResult } = require("express-validator");

const addressValidationSchema = [
  body("location")
    .optional()  
    .isString().withMessage("Location must be a string"),

  body("city")
    .notEmpty().withMessage("City is required")
    .isString().withMessage("City must be a string"),

  body("pincode")
    .notEmpty().withMessage("Pincode is required")
    .isNumeric().withMessage("Pincode must be a number")
    .isLength({ min: 6, max: 6 }).withMessage("Pincode must be 6 digits"),

  body("state")
    .notEmpty().withMessage("State is required")
    .isString().withMessage("State must be a string"),

  body("country")
    .optional() // optional since default = India
    .isString().withMessage("Country must be a string"),
];




function validateAddress(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    let err = result.array();
    return res.status(400).json({
      status: "Failed",
      message: err[0].msg,
    });
  } else {
    next();
  }
}

module.exports = { addressValidationSchema, validateAddress };
