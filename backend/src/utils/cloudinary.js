const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and deletes the local temporary file.
 * @param {string} localFilePath - Path to the local file.
 * @returns {Promise<object|null>} - Cloudinary response object or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary ", response.url);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    }
    throw error; // Throw error so controller can return details
  }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the file to delete.
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        if (!publicId) return null;
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error("Error deleting from cloud:", error);
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
