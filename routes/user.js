const express = require("express");
const router = express.Router();
const {register,login}=require("../controllers/user")
const { userFieldValidations,userFieldValidationsLogin,validateUserSchema,validatingEmailMpbile}=require("../middlewares/user")

router.post("/register",userFieldValidations,validateUserSchema,register);
router.post("/login",userFieldValidationsLogin,validateUserSchema,login);


module.exports=router;
