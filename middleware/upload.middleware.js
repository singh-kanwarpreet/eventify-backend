const cloudinary = require("../utils/cloudinary");

const uploadToCloudinary = (fieldName, folder = "event-management") => {
  return async (req, res, next) => {
    try {
      if (!req.file) return next(); 

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      req.body.imageUrl = result.secure_url; 
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }
  };
};

module.exports = uploadToCloudinary;
