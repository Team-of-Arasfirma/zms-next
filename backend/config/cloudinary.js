import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


// Load environment variables.
dotenv.config();

// Check Cloudinary credentials without exposing secret values.
console.log("Cloudinary config check:", {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyExists: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretExists: Boolean(process.env.CLOUDINARY_API_SECRET),
});

// Connect Cloudinary account.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Project, product, and blog image upload storage.
export const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ZMS/projects",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: "fill",
          quality: "auto",
        },
      ],
    };
  },
});

// Resume file upload storage for job applications.
// Resume files will be stored in Cloudinary inside ZMS/resumes folder.
export const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileNameWithoutExtension = file.originalname
      .split(".")[0]
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    return {
      folder: "ZMS/resumes",
      resource_type: "raw",
      public_id: `${Date.now()}-${fileNameWithoutExtension}`,
    };
  },
});

// Client logo upload storage.
export const clientStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ZMS/clients",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    };
  },
});

export default cloudinary;