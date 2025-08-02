const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/user")
const jwt_key = process.env.JWT_SECRET_KEY



async function authenticateUser(req,res,next){
    try{
        // console.log(User);
        let token = req.headers["authorization"].split(" ")[1]
        // let token = req.headers["authorization"]
        // console.log(token);
        
        if(!token){
            return res.status(401).json({
                status: "Failed",
                message:"Unauthorized user"
            })
        }

        let decoded = await jwt.verify(token,jwt_key)
        console.log(decoded);
        
        // req.user_id = decoded;
        const user = await User.findById(decoded.user_id); 
        // console.log(user);
        
        if (!user) {
            return res.status(401).json({
                status: "Failed",
                message: "User not found"
            });
        }
        req.user = user;
        next();
    }catch(err){
        console.log(err);
        
        return res.status(500).json({
            status:"Failed",
            message:"Authentication failed"
        })
    }  
}

module.exports = { authenticateUser }