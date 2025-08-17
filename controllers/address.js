const Address = require("../models/address");

async function createAddress(req, res) {
  try {
    const userId = req.user._id;

    const existingAddress = await Address.findOne({ user_id: userId });
    if (existingAddress) {
      return res.status(400).json({
        status: "Failed",
        message: "You already have an address. Only one address allowed per user.",
      });
    }

    const { location, city, pincode, state, country } = req.body;
    // console.log(location);
    

    const newAddress = await Address.create({
      user_id: userId,
      location,
      city,
      pincode,
      state,
      country,
    });

    return res.status(201).json({
      status: "Success",
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (err) {
    console.log(err);
    
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}


async function getAddress(req, res) {
  try {
    const userId = req.user._id;

    const address = await Address.findOne({ user_id: userId });
  

    if (!address) {
      return res.status(404).json({
        status: "Failed",
        message: "No address found for this user",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: address,
    });
  } catch (err) {
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}


async function updateAddress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ status: "Failed", message: "Address not found" });
    }

    if (address.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ status: "Failed", message: "Unauthorized to update this address" });
    }

    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).json({
      status: "Success",
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (err) {
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}


async function deleteAddress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ status: "Failed", message: "Address not found" });
    }

    if (address.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ status: "Failed", message: "Unauthorized to delete this address" });
    }

    await Address.findByIdAndDelete(id);

    return res.status(200).json({
      status: "Success",
      message: "Address deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: "Failed", message: err.message });
  }
}

module.exports = { createAddress, getAddress, updateAddress, deleteAddress };
