const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const {validateCharity,charityValidationSchema} = require("../middlewares/charity")
const {createCharity,getCharityForAdmin,getAllCharitiesPublic}=require("../controllers/charity")




router.post( "/",authenticateUser,uploadImage,charityValidationSchema,validateCharity,createCharity)
router.get("/admin", authenticateUser, getCharityForAdmin);
router.get("/", getAllCharitiesPublic);

module.exports=router