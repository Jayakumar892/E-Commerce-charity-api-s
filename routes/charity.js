const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const {validateCharity,charityValidationSchema} = require("../middlewares/charity")
const {createCharity,getCharityForAdmin,getAllCharitiesPublic,getCharityById,getCharityByIdAdmin,updateCharity}=require("../controllers/charity")




router.post( "/",authenticateUser,uploadImage,charityValidationSchema,validateCharity,createCharity)
router.get("/admin", authenticateUser, getCharityForAdmin);
router.get("/", getAllCharitiesPublic);
router.get("/admin/:id",authenticateUser, getCharityByIdAdmin);
router.get("/:id", getCharityById);
router.patch("/:id", authenticateUser, uploadImage,charityValidationSchema,validateCharity, updateCharity);

module.exports=router