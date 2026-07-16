import express from "express";
import multer from "multer";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { projectStorage } from "../config/cloudinary.js";

const router = express.Router();

// Configure Multer to receive image files.
// Cloudinary storage is used, so images will not be stored in the local folder.
const upload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum image size is 10MB
  },
});

// Common upload middleware for project image uploads.
// This middleware handles image upload errors for both POST and PUT requests.
const uploadProjectImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      console.error("Multer / Cloudinary Upload Error:", error);

      return res.status(500).json({
        message: error.message || "Image upload failed",
      });
    }

    next();
  });
};

// Get all projects
router.get("/", getProjects);

// RBAC CHANGE: Protect project create, update, and delete actions.
router.post(
  "/",
  requireAuth,
  requirePermission("projects", "create"),
  uploadProjectImage,
  createProject
);

// Update an existing project
// Image upload is optional during update.
// If a new image is uploaded, it will replace the old image.
// If no image is uploaded, the old image will remain unchanged.
router.put(
  "/:id",
  requireAuth,
  requirePermission("projects", "edit"),
  uploadProjectImage,
  updateProject
);

// Delete a project
router.delete(
  "/:id",
  requireAuth,
  requirePermission("projects", "delete"),
  deleteProject
);

export default router;
