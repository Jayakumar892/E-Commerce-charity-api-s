const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  charity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Charity"
  },
  quantity: {
    type: Number,
    min: 1
  },
  amount: {
    type: Number
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);