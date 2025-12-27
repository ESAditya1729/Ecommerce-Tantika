// src/config/cloudinary.js
export const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
};

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
export const CLOUDINARY_DESTROY_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/destroy`;