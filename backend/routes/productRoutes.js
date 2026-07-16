import express from "express";
import multer from "multer";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { projectStorage } from "../config/cloudinary.js";

const router = express.Router();

// Configure Multer to receive product images.
const upload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum image size is 10MB
  },
});

// Common upload middleware for product images.
const uploadProductImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      console.error("Product Image Upload Error:", error);

      return res.status(500).json({
        message: error.message || "Product image upload failed",
      });
    }

    next();
  });
};

// Get all products
router.get("/", getProducts);

// RBAC CHANGE: Protect product create, update, and delete actions.
router.post(
  "/",
  requireAuth,
  requirePermission("products", "create"),
  uploadProductImage,
  createProduct
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("products", "edit"),
  uploadProductImage,
  updateProduct
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("products", "delete"),
  deleteProduct
);

export default router;
