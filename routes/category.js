const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const { categoryValidationSchema, validateCategory } = require("../middlewares/validationCategory");
const { createCategory } = require("../controllers/createCategory");


router.post( "/create", authenticateUser, uploadImage, categoryValidationSchema, validateCategory, createCategory);

module.exports = router;
