import express from "express";
import multer from "multer";
import { extname } from "node:path";

import {
  getPublishedCategories,
  getCategoryBySlug,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/productCategoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { productCategoryStorage } from "../config/cloudinary.js";

const upload = multer({
  storage: productCategoryStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype) ||
        ![".jpg", ".jpeg", ".png", ".webp"].includes(extname(file.originalname).toLowerCase())) {
      const error = new Error("Only JPG, PNG, or WEBP category images are allowed.");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

export const uploadCategoryImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();
    const status = error.code === "LIMIT_FILE_SIZE" ? 413
      : error instanceof multer.MulterError ? 400
        : error.statusCode || (error.http_code === 400 ? 400 : 500);
    return res.status(status).json({
      message: error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "Category image must be 10 MB or smaller."
        : status === 500 ? "Category image upload failed." : error.message,
    });
  });
};

export const publicCategoryRouter = express.Router();
publicCategoryRouter.get("/", getPublishedCategories);
publicCategoryRouter.get("/:slug", getCategoryBySlug);

export const adminCategoryRouter = express.Router();
adminCategoryRouter.use(requireAuth);
adminCategoryRouter.get("/", requirePermission("productCategories", "view"), getAllCategories);
adminCategoryRouter.post(
  "/",
  requirePermission("productCategories", "create"),
  uploadCategoryImage,
  createCategory
);
adminCategoryRouter.put(
  "/:id",
  requirePermission("productCategories", "edit"),
  uploadCategoryImage,
  updateCategory
);
adminCategoryRouter.delete("/:id", requirePermission("productCategories", "delete"), deleteCategory);
