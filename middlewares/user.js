const { body, validationResult } = require("express-validator");
const userFieldValidations = [
  body("name")
    .notEmpty().withMessage("Name is required"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Provide a valid email"),

  body("mobile")
    .notEmpty().withMessage("Mobile number is required"),

 body("password")
  .notEmpty().withMessage("Password is required")
  .isLength({ min: 6, max: 12 }).withMessage("Password must be between 6 and 12 characters")
  .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&])/)
  .withMessage("Password must contain at least 1 uppercase letter, 1 number, and 1 special character")
,

  body("role")
    .optional()
    .isIn(["user", "admin", "super-admin"])
    .withMessage("Role must be one of: user, admin, super-admin"),
];


const userFieldValidationsLogin = [
  body("loginid")
    .notEmpty()
    .withMessage("Email or Mobile is required"),

  body("password")
  .notEmpty().withMessage("Password is required")
  .isLength({ min: 6, max: 12 }).withMessage("Password must be between 6 and 12 characters")
  .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&])/)
  .withMessage("Password must contain at least 1 uppercase letter, 1 number, and 1 special character")

]

function validateUserSchema(req, res, next) {
  // console.log(req.body);  
  let results = validationResult(req);
  if (!results.isEmpty()) {
    let errors = results.array();
    return res.status(400).json({
      status: "Failed",
      message: errors[0].msg
    });
  } else {
    next();
  }
}


module.exports = { userFieldValidations, userFieldValidationsLogin, validateUserSchema }