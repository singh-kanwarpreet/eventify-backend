const cloudinary = require("../utils/cloudinary");

const uploadToCloudinary = async (file) => {
  try {
    if (!file) return null;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "event-management" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };
