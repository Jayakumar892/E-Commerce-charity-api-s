    const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v); 
        },
        message: "Invalid pincode number",
      },
    },
    state: {
      
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "India",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
