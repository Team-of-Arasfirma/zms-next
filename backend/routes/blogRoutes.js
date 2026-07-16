import express from "express";
import multer from "multer";

import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  getBlogs,
  updateBlog,
} from "../controllers/blogController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { projectStorage } from "../config/cloudinary.js";

const router = express.Router();

// Configure Multer to receive blog cover images.
const upload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Common upload middleware for blog cover images.
const uploadBlogCoverImage = (req, res, next) => {
  upload.single("coverImage")(req, res, (error) => {
    if (error) {
      console.error("Blog Image Upload Error:", error);

      return res.status(500).json({
        message: error.message || "Blog image upload failed",
      });
    }

    next();
  });
};

// Public lightweight blog listing.
router.get("/", getBlogs);

// Admin full blog data by ID.
// Keep this route before "/:slug".
router.get(
  "/admin/:id",
  requireAuth,
  requirePermission("blogs", "edit"),
  getBlogById
);

// Public full blog detail by slug.
router.get("/:slug", getBlogBySlug);

// Create blog.
router.post(
  "/",
  requireAuth,
  requirePermission("blogs", "create"),
  uploadBlogCoverImage,
  createBlog
);

// Update blog.
router.put(
  "/:id",
  requireAuth,
  requirePermission("blogs", "edit"),
  uploadBlogCoverImage,
  updateBlog
);

// Delete blog.
router.delete(
  "/:id",
  requireAuth,
  requirePermission("blogs", "delete"),
  deleteBlog
);

export default router;