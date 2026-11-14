import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Existing project, product and blog image storage: unchanged.
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

// Existing resume storage: unchanged.
export const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extension = file.originalname.split(".").pop().toLowerCase();
    const fileNameWithoutExtension = file.originalname
      .replace(/\.[^/.]+$/, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const safeFileName = fileNameWithoutExtension || "resume";

    return {
      folder: "ZMS/resumes",
      resource_type: "raw",
      public_id: `${Date.now()}-${safeFileName}.${extension}`,
    };
  },
});

// Existing client logo storage: unchanged.
export const clientStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ZMS/clients",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
  }),
});

// Category cards use a dedicated folder. Only new uploads go here.
// crop: "limit" avoids trimming category imagery.
export const productCategoryStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ZMS/product-categories",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: "limit",
        quality: "auto",
      },
    ],
  }),
});

export default cloudinary;
