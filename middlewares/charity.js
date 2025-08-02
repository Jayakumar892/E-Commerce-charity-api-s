const { body, validationResult } = require("express-validator");

const charityValidationSchema = [
    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 30, max: 100 }).withMessage("Description must be between 30 and 100 characters"),

    body("name")
        .notEmpty().withMessage("Charity name is required")
        .isAlpha("en-US", { ignore: " " }).withMessage("Name must contain only alphabets and spaces"),

    body("charity_email")
        .notEmpty().withMessage("Charity email is required")
        .isEmail().withMessage("Invalid email format"),

    body("start_date")
        .notEmpty().withMessage("Start date is required")
        .isISO8601().toDate().withMessage("Start date must be in ISO (UTC) format"),

    body("end_date")
        .notEmpty().withMessage("End date is required")
        .isISO8601().toDate().withMessage("End date must be in ISO (UTC) format"),

    body("donation_fee")
        .optional().isNumeric().withMessage("Donation fee must be a number"),

    body("platform_fee")
        .optional().isNumeric().withMessage("Platform fee must be a number"),

    body("profit")
        .optional().isNumeric().withMessage("Profit must be a number")
];


function validateCharity(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }
    next();
}

module.exports = { charityValidationSchema, validateCharity };
