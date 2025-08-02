const Charity = require("../models/charity");
const { uploadToCloudinary } = require("../utils/cloudinary");

const allowedRoles = ["admin", "super-admin"];
const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

async function createCharity(req, res) {
  try {
    const {name, description, charity_email, start_date, end_date} = req.body;

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: "Failed",
         message: "Unauthorized role" 
        });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
         status: "Failed", 
         message: "Banner image is required"
         });
    }

    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        status: "Failed",
         message: "Invalid image format" 
        });
    }

    if (req.file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        status: "Failed", 
        message: "Image must be ≤ 1MB" 
    });
    }

    const totalFee = 70 + 10 + 20;
    if (totalFee > 100) {
      return res.status(400).json({ 
        status: "Failed", 
        message: "Fees exceed 100%" 
    });
    }

    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ 
        status: "Failed",
         message: "Invalid date format"
         });
    }

    if (startDate <= now) {
      return res.status(400).json({ 
        status: "Failed", 
        message: "Start date must be in the future"
     });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ 
        status: "Failed",
         message: "End date must be after start date" 
        });
    }

    const bannerURL = await uploadToCloudinary(req.file.buffer);

    const charity = await Charity.create({
      name,
      description,
      banner: bannerURL,
      charity_email,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      user_id: req.user._id,
    });

    res.status(201).json({ 
        status: "Success", 
        message: "Charity created",
         data: charity });

  } catch (err) {
    res.status(500).json({ 
        status: "Failed",
         message: err.message });
  }
}
async function getCharityForAdmin(req, res) {
  try {
    const user = req.user;
// console.log(user);
// console.log(user.role);
    let charities;
    if (user.role === "super-admin") {
    //   charities = await Charity.find();
      charities = await Charity.find().populate("user_id", "name email");
    } else if (user.role === "admin") {
      charities = await Charity.find({ user_id: user._id }).populate("user_id", "name email");
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    return res.status(200).json({
      status: "Success",
      data: charities
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getAllCharitiesPublic(req, res) {
  try {
    const charities = await Charity.find().populate("user_id", "name email");

    return res.status(200).json({
      status: "Success",
      data: charities
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports={createCharity,getCharityForAdmin,getAllCharitiesPublic}