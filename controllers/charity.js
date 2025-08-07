const Charity = require("../models/charity");
const { uploadToCloudinary } = require("../utils/cloudinary");

const allowedRoles = ["admin", "super-admin"];
const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

async function createCharity(req, res) {
  try {
    console.log(req.body);

    const { name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit } = req.body;
    const existingCharity = await Charity.findOne({
      $or: [{ name }, { charity_email }]
    });

    if (existingCharity) {
      return res.status(400).json({
        message: "Charity with the same name or email already exists"
      });
    }

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

    const totalFee = (platform_fee || 10) + (donation_fee || 70) + (profit || 20);
    if (totalFee > 100) {
      return res.status(400).json({
        status: "Failed",
        message: "Fees exceed 100% or less than 100% is not allowed"
      });
    }

    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);



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
      data: charity
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
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

const getCharityById = async (req, res) => {
  try {
    // console.log("%%%%%%%%%%");

    const charity = await Charity.findById(req.params.id).populate("user_id", "name email");
    if (!charity) {
      return res.status(404).json({
        message: "Charity not found"
      });
    }

    res.status(200).json({
      status: "Success",
      data: charity
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
const getCharityByIdAdmin = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id).populate("user_id", "name email");
    if (!charity) {
      return res.status(404).json({
        message: "Charity not found"
      });
    }
    // console.log(req.user);

    const isOwner = charity.user_id._id.toString() === req.user.user_id;
    if (req.user.role !== "super-admin" && !isOwner) {
      return res.status(403).json({
        message: "Access denied: not your charity"
      });
    }

    res.status(200).json({ status: "Success", data: charity });
  } catch (error) {


    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const updateCharity = async (req, res) => {
  try {
    const charityId = req.params.id;
    const {
      name,
      description,
      charity_email,
      start_date,
      end_date,
      platform_fee,
      donation_fee,
      profit
    } = req.body;

    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({
        status: "Failed",
        message: "Charity not found"
      });
    }

    if (
      charity.user_id.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized to update this charity"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized role"
      });
    }


    let bannerURL = charity.banner;
    if (req.file && req.file.buffer) {
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


      bannerURL = await uploadToCloudinary(req.file.buffer);
    }

    const updatedPlatformFee = platform_fee ?? charity.platform_fee ?? 10;
    const updatedDonationFee = donation_fee ?? charity.donation_fee ?? 70;
    const updatedProfit = profit ?? charity.profit ?? 20;
  const totalFee =
  Number(updatedPlatformFee) +
  Number(updatedDonationFee) +
  Number(updatedProfit);

    if (totalFee !== 100) {
      console.log(totalFee);
      
      return res.status(400).json({
        status: "Failed",
        message: "Total of platform, donation, and profit fees must be 100%"
      });
    }


    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

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


    const updatedCharity = await Charity.findByIdAndUpdate(
      charityId,
      {
        name,
        description,
        charity_email,
        start_date,
        end_date,
        platform_fee,
        donation_fee,
        profit,
      },
      { new: true }
    );

    res.status(200).json({
      status: "Success",
      message: "Charity updated successfully",
      data: updatedCharity
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};



module.exports = { createCharity, getCharityForAdmin, getAllCharitiesPublic, getCharityById, getCharityByIdAdmin, updateCharity }