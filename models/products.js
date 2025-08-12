const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
    required: true
  },
  long_description: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  charity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Charity",
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  quantity: {
    type: Number,
    required: true,
    min: 25,
    max: 50,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "active", "sold", "inactive"],
    default: "pending",
  },
  image: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const userModel = mongoose.model("Product", productSchema);
module.exports=userModel







