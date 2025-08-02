const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const { categoryValidationSchema, validateCategory } = require("../middlewares/validationCategory");
const { createCategory,
    getAllCategories,
    getAdminCategories,
    updateCategory} = require("../controllers/createCategory");


router.post( "/create", authenticateUser, uploadImage, categoryValidationSchema, validateCategory, createCategory);
router.get("/", getAllCategories);
router.get("/admin", authenticateUser, getAdminCategories);
router.patch("/", authenticateUser, updateCategory);

module.exports = router;
