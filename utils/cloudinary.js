const cloudinary = require("cloudinary").v2
require("dotenv").config()

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
const api_key = process.env.CLOUDINARY_API_KEY
const api_secret = process.env.CLOUDINARY_API_SECRET


cloudinary.config({
    cloud_name,
    api_key,
    api_secret
})

function uploadToCloudinary(buffer)
{
    return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream({ resource_type: "image" },(error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url); 
      }
    );
    stream.end(buffer);
  })
}

module.exports = { uploadToCloudinary }