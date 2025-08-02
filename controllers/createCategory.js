const Category = require("../models/category");
const { uploadToCloudinary } = require("../utils/cloudinary");

async function createCategory(req, res) {
    try {
        console.log("Uploaded file:", req.file);
        console.log("Request body:", req.body);

        const { title } = req.body;

        const allowedRoles = ["admin", "super-admin"];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "Failed",
                message: "Only admin and super admin can create a category"
            });
        }

   

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                status: "Failed",
                message: "Image is required"
            });
        }

        const imageURL = await uploadToCloudinary(req.file.buffer);

       
        const newCategory = {
            title,
            image: imageURL,
            user_id: req.user._id
        };

        const data = await Category.insertOne(newCategory);

        res.status(201).json({
            status: "Success",
            message: "Category created successfully",
            data
        });
    } catch (err) {
        console.error("Create Category Error:", err.message);
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

module.exports = { createCategory };
