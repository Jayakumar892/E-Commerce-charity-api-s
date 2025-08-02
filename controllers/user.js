const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config()
 const jwt_key = process.env.JWT_SECRET_KEY; 

async function register(req, res) {
    try {
        const { name, email, mobile, password, role } = req.body;
        console.log(req.body);
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }], });
        console.log(existingUser);

        if (existingUser) {
            return res.status(400).json({
                status: "Failed",
                message: "User with this email or mobile already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: role || "user",
        });
        console.log(user);
        console.log('%%%%%%%%%%');
        let data = await User.insertOne(user );
        console.log(data);

        return res.status(201).json({
            status: "success",
            message: "User registration successful",
            data: data,
        });
    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message,
        });
    }
}


async function login(req, res) {
    try {
        const { loginid,password } = req.body;
        email=loginid
        mobile=loginid
        const user = await User.findOne({
            $or: [{ email }, { mobile }],
        });

        if (!user) {
            return res.status(400).json({
                status: "Failed",
                message: "User not found",
            });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        // console.log(isMatch);

        if (!isMatch) {
            return res.status(401).json({
                status: "Failed",
                message: "Invalid password",
            });
        }
        const token = jwt.sign({ user_id: user._id, email: user.email },jwt_key, { expiresIn: "1h" });
        console.log(token);
        
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            path: "/",
        });

        return res.status(200).json({
            status: "Success",
            message: "Login successful",
            token:token
        });

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message,
        });
    }
}
module.exports = { register, login }