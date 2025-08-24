const Order = require("../models/order");
const Product = require("../models/products");
const Charity = require("../models/charity");
const Address = require("../models/address");
const User = require("../models/user");
const { sendOrderNotifications } = require("../utils/notification");

async function createOrder(req, res) {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user._id;

    
    const address = await Address.findOne({ user_id });
    if (!address) {
      return res.status(400).json({
        status: "Failed",
        message: "Please add an address before placing an order"
      });
    }


    const product = await Product.findById(product_id).populate("charity_id");
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found"
      });
    }


    if (product.charity_id.status !== "live") {
      console.log(product.charity_id.status);
      
      return res.status(400).json({
        status: "Failed",
        message: "Charity is not currently active"
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        status: "Failed",
        message: "Product is not available"
      });
    }

    
    if (product.quantity < quantity) {
      return res.status(400).json({
        status: "Failed",
        message: `Only ${product.quantity} items available`
      });
    }

   
    const priceAfterDiscount = product.price - (product.price * (product.discount / 100));
    const amount = priceAfterDiscount * quantity;


    const order = await Order.create({
      user_id,
      product_id,
      charity_id: product.charity_id._id,
      quantity,
      amount
    });

    
    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.status = "sold";
    }
    await product.save();


    const user = await User.findById(user_id);
    const charityOwner = await User.findById(product.charity_id.user_id);

 
   
    await sendOrderNotifications(user, charityOwner, product, order, quantity);


    res.status(201).json({
      status: "Success",
      message: "Order created successfully",
      data: order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
}

async function getUserOrders(req, res) {
  try {
    const user_id = req.user._id;
    
    const orders = await Order.find({ user_id })
      .populate("product_id", "title price image")
      .populate("charity_id", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "Success",
      count: orders.length,
      data: orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user._id;

    const order = await Order.findById(id)
      .populate("product_id", "title price image")
      .populate("charity_id", "name")
      .populate("user_id", "name email");

    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "Order not found"
      });
    }

    // Check if user owns the order or is admin/super-admin
    if (order.user_id._id.toString() !== user_id.toString() && 
        !["admin", "super-admin"].includes(req.user.role)) {
      return res.status(403).json({
        status: "Failed",
        message: "Access denied"
      });
    }

    res.status(200).json({
      status: "Success",
      data: order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
}

async function getOrdersByCharity(req, res) {
  try {
    const { charityID } = req.params;
    const user_id = req.user._id;

    // Verify charity exists and user has access
    const charity = await Charity.findById(charityID);
    if (!charity) {
      return res.status(404).json({
        status: "Failed",
        message: "Charity not found"
      });
    }

    // Check if user is charity owner or super-admin
    if (charity.user_id.toString() !== user_id.toString() && 
        req.user.role !== "super-admin") {
      return res.status(403).json({
        status: "Failed",
        message: "Access denied"
      });
    }

    const orders = await Order.find({ charity_id: charityID })
      .populate("product_id", "title price")
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "Success",
      count: orders.length,
      data: orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrdersByCharity
};