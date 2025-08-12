const express = require("express");
const router = express.Router();


const { uploadImage } = require("../middlewares/multer"); 
const { authenticateUser } = require("../middlewares/auth");
const { productFieldValidations, validateProductSchema } = require("../middlewares/products");
const { createProduct,getAllProducts,getProductById,getProductsByCharityForAdmin,getProductsByCharityPublic,getProductsByCategory,updateProductStatus,updateProduct} = require("../controllers/products");

router.post(
  "/",
  authenticateUser,
  uploadImage,
  productFieldValidations,
  validateProductSchema,
  createProduct
);
router.patch("/:id", authenticateUser, updateProduct);
router.put("/:id", authenticateUser, updateProductStatus);
router.get("/charity/:id", getProductsByCharityPublic);
router.get("/category/:id", getProductsByCategory);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/admin/charity/:id", authenticateUser,getProductsByCharityForAdmin);




module.exports = router;
