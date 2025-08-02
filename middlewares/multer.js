const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })

function uploadImage(req, res, next) {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                 message: err.message
                 });
        }
        try {
            // console.log(req.file);
            // console.log(req.body);
            if (!req.file) {
                return res.status(400).json({
                    status: "Failed",
                    message: "Missing required field: image",
                    hint: "Make sure you're sending the file with field name 'image'",
                });
            }

            const imgTypes = /^image\/(jpg|jpeg|png)$/;
            const mimeType = imgTypes.test(req.file.mimetype);
            if (!mimeType) {
                return res.status(400).json({
                    status: "Failed",
                    message: "Only .png, .jpg and .jpeg formats are allowed!"
                })
            }
            if (req.file.size > 2 * 1024 * 1024) {
                return res.status(400).json({
                    status: "Failed",
                    message: "Image file should not exceed 2MB",
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                status: "Failed",
                message: error.message
            })
        }
    })
}

module.exports = { uploadImage }