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

        const data = await Category.create(newCategory);

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

async function getAllCategories(req, res) {
    try {
        const categories = await Category.find();
        res.status(200).json({ 
            status: "Success", 
            data: categories
         });
    } catch (err) {
        res.status(500).json({ status: "Failed", message: err.message });
    }
}

async function getAdminCategories(req, res) {
    try {
        console.log(req.user);
        
        const categories = await Category.find({ user_id: req.user._id });
        res.status(200).json({
             status: "Success",
              data: categories 
            });
    } catch (err) {
        res.status(500).json({ status: "Failed", message: err.message });
    }
}

async function updateCategory(req, res) {
    try {
        const { categoryId, newTitle } = req.body;
        // console.log(categoryId,newTitle);
        

        const category = await Category.findById(categoryId);
        // console.log(category);
        // console.log(category.user_id );
        // console.log(req.user._id);
        
        
        
        if (!category) {
            return res.status(404).json({ 
                status: "Failed", 
                message: "Category not found"
             });
        }

        if (category.user_id === req.user._id) {
            return res.status(403).json({
                 status: "Failed", 
                 message: "You are not authorized to update this category" 
                });
        }

        category.title = newTitle;
        await category.save();

        res.status(200).json({ 
            status: "Success", 
            message: "Category updated", 
            data: category 
        });
    } catch (err) {
        res.status(500).json({ status: "Failed", message: err.message });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getAdminCategories,
    updateCategory,
};
