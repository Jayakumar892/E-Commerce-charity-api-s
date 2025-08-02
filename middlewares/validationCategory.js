const { body,validationResult } = require("express-validator")

const categoryValidationSchema = [
    body("title")
    .notEmpty().withMessage("Title is required")
    .isString().withMessage("Title should be a string"),
]

function validateCategory(req, res, next) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        let err = result.array();
        return res.status(400).json({
            message: err[0].msg
        })
    } else {
        next()
    }
}

module.exports = { categoryValidationSchema, validateCategory }
