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

  params: async () => ({
    folder: "ZMS/projects",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    transformation: [
      {
        width: 1200,
        height: 800,
        crop: "fill",
        quality: "auto",
      },
    ],
  }),
});

// Resume file upload storage for job applications.
export const resumeStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const extension = file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const fileNameWithoutExtension = file.originalname
      .replace(/\.[^/.]+$/, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const safeFileName =
      fileNameWithoutExtension || "resume";

    return {
      folder: "ZMS/resumes",

      // Documents must be uploaded as raw assets.
      resource_type: "raw",

      // Raw Cloudinary public IDs must include the extension.
      public_id: `${Date.now()}-${safeFileName}.${extension}`,
    };
  },
});

// Client logo upload storage.
export const clientStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "ZMS/clients",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
  }),
});

export default cloudinary;