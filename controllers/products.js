const Product = require("../models/products");
const Charity = require("../models/charity");
const Category = require("../models/category");
const { uploadToCloudinary } = require("../utils/cloudinary");

const allowedRoles = ["admin", "super-admin"];
const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

async function createProduct(req, res) {
  try {
    const {
      title,
      short_description,
      long_description,
      charity_id,
      category_id,
      quantity,
      price,
      discount = 0,
    } = req.body;

    const user = req.user;
    const existingProduct = await Product.findOne({ title: title.trim() });

    if (existingProduct) {
      return res.status(400).json({
        status: "Failed",
        message: "Product already exists with this title",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: "Failed",
        message: "Access denied"
      });
    }

    const charity = await Charity.findById(charity_id);
    if (!charity) {
      return res.status(400).json({
        status: "Failed",
        message: "Charity not found"
      });
    }

    if (user.role === "admin" && charity.user_id.toString() !== user.user_id.toString()) {
      return res.status(400).json({
        status: "Failed",
        message: "You are not a member of this charity"
      });
    }

    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({
        status: "Failed",
        message: "Category not found"
      });
    }

    if (user.role === "admin" && category.user_id.toString() !== user.user_id.toString()) {
      return res.status(400).json({
        status: "Failed",
        message: "You are not a member of this category"
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ status: "Failed", message: "Product image is required" });
    }

    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ status: "Failed", message: "Invalid image format" });
    }

    if (req.file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ status: "Failed", message: "Image must be ≤ 1MB" });
    }

    const imageURL = await uploadToCloudinary(req.file.buffer);
    const productData = {
      title,
      short_description,
      long_description,
      user_id: user._id,
      charity_id,
      category_id,
      quantity: Number(quantity),
      price: Number(price),
      discount: Number(discount),
      image: imageURL
    };


    const product = await Product.create(productData);

    // console.log("Created Product:", product);

    return res.status(201).json({
      status: "Success",
      message: "Product created successfully",
      data: product
    });

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
   

    res.status(200).json({
      status: "Success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};
async function getProductsByCharityForAdmin(req, res) {
  try {
    const { id: charity_id } = req.params;
    const { user_id, role } = req.user;

    const charity = await Charity.findById(charity_id);
    if (!charity) {
      return res.status(404).json({
        status: "Failed",
        message: "Charity not found",
      });
    }


    if (role === "admin" && charity.user_id.toString() !== user_id) {
      return res.status(403).json({
        status: "Failed",
        message: "Access denied. Not the owner of this charity.",
      });
    }

    const products = await Product.find({ charity_id });

    res.status(200).json({
      status: "Success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products by charity ID for admin:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};


async function getProductsByCharityPublic(req, res) {
  try {
    const { id: charity_id } = req.params;

    const products = await Product.find({ charity_id }); 

    res.status(200).json({
      status: "Success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products for public:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};
async function getProductsByCategory(req, res) {
  try {
    const { id: category_id } = req.params;

    const products = await Product.find({ category_id });

    res.status(200).json({
      status: "Success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

async function updateProductStatus(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { status } = req.body;
    console.log(status);


    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: "Failed", message: "Product not found" });
    }

    if (user.role === "admin" && product.user_id.toString() !== user.user_id) {
      return res.status(403).json({ status: "Failed", message: "Access denied" });
    }

    product.status = status;
    await product.save();

    res.status(200).json({ status: "Success", message: "Status updated", data: product });

  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};


async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const user = req.user;
    const {
      title,
      short_description,
      long_description,
      quantity,
      price,
      discount,
      category_id,
      charity_id,
      status
    } = req.body;

    console.log("User:", user);
    console.log(req.body);


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: "Failed", message: "Product not found" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ status: "Failed", message: "Access denied" });
    }

    if (user.role === "admin" && product.user_id.toString() !== user._id.toString()) {
      return res.status(403).json({ status: "Failed", message: "You are not the owner of this product" });
    }


    let imageURL = product.image;
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({ status: "Failed", message: "Invalid image file" });
      }
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ status: "Failed", message: "Invalid image format" });
      }
      if (req.file.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({ status: "Failed", message: "Image must be ≤ 1MB" });
      }
      imageURL = await uploadToCloudinary(req.file.buffer);
    }
    
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (short_description !== undefined) updateFields.short_description = short_description;
    if (long_description !== undefined) updateFields.long_description = long_description;
    if (quantity !== undefined) updateFields.quantity = Number(quantity);
    if (price !== undefined) updateFields.price = Number(price);
    if (discount !== undefined) updateFields.discount = Number(discount);
    if (category_id !== undefined) updateFields.category_id = category_id;
    if (charity_id !== undefined) updateFields.charity_id = charity_id;
    if (status !== undefined) updateFields.status = status;
    if (imageURL) updateFields.image = imageURL;


    const updatedProduct = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

    return res.status(200).json({
      status: "Success",
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}






module.exports = { createProduct, getAllProducts, getProductById, getProductsByCharityForAdmin, getProductsByCharityPublic, getProductsByCategory, updateProductStatus, updateProduct };
