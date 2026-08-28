import express from "express";
import multer from "multer";

import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  getBlogCategories,
  getBlogSubCategories,
  getBlogs,
  updateBlog,
} from "../controllers/blogController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { projectStorage } from "../config/cloudinary.js";

const router = express.Router();

const upload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

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

router.get("/", getBlogs);

// These option routes must remain before the dynamic slug route.
router.get("/categories", getBlogCategories);
router.get("/sub-categories", getBlogSubCategories);

router.get(
  "/admin/:id",
  requireAuth,
  requirePermission("blogs", "edit"),
  getBlogById
);

router.get("/:slug", getBlogBySlug);

router.post(
  "/",
  requireAuth,
  requirePermission("blogs", "create"),
  uploadBlogCoverImage,
  createBlog
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("blogs", "edit"),
  uploadBlogCoverImage,
  updateBlog
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("blogs", "delete"),
  deleteBlog
);

export default router;