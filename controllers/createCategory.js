const Category = require("../models/category");
const { uploadToCloudinary } = require("../utils/cloudinary");

const allowedRoles = ["admin", "super-admin"];
const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;


async function createCategory(req, res) {
    try {
        const { title } = req.body;
        // console.log(req.body);
        const existingCategory = await Category.findOne({ title: title.trim() });
        if (existingCategory) {
            return res.status(400).json({
                status: "Failed",
                message: "Category with this title already exists",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "Failed",
                message: "Only admin and super-admin can create categories"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: "Failed",
                message: "Image is required"
            });
        }

        if (!allowedImageTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                status: "Failed", message:
                    "Invalid image format"
            });
        }

        if (req.file.size > MAX_IMAGE_SIZE) {
            return res.status(400).json({
                status: "Failed",
                message: "Image must be <= 1MB"
            });
        }

        const imageURL = await uploadToCloudinary(req.file.buffer);

        const newCategory = await Category.create({
            title,
            image: imageURL,
            user_id: req.user._id
        });

        res.status(201).json({
            status: "Success",
            message: "Category created successfully",
            data: newCategory
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}



async function getAllCategories(req, res) {
    try {
        const categories = await Category.find({});
        res.status(200).json({
            status: "Success",
            count: categories.length,
            data: categories
        });
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}


async function getAdminCategories(req, res) {
    try {
        let categories;

        if (req.user.role === "super-admin") {
            categories = await Category.find({});
        } else if (req.user.role === "admin") {
            categories = await Category.find({ user_id: req.user._id });
        } else {
            return res.status(403).json({
                status: "Failed",
                message: "Access denied. Only admin or super-admin can view admin categories"
            });
        }

        res.status(200).json({
            status: "Success",
            count: categories.length,
            data: categories
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}


async function updateCategory(req, res) {
    try {
        const { categoryId, newTitle } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                status: "Failed",
                message: "Category not found"
            });
        }
        const isOwner = category.user_id.toString() === req.user._id.toString();
        // console.log(category.user_id);

        const isSuperAdmin = req.user.role === "super-admin";

        if (!isOwner && !isSuperAdmin) {
            return res.status(403).json({
                status: "Failed",
                message: "You are not authorized to update this category"
            });
        }

        category.title = newTitle;
        await category.save();

        res.status(200).json({
            status: "Success",
            message: "Category updated successfully",
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
    updateCategory
};
