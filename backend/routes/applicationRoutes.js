import express from "express";
import multer from "multer";

import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { resumeStorage } from "../config/cloudinary.js";

const router = express.Router();

const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }

    cb(null, true);
  },
});

// Submit application with resume upload.
router.post("/", uploadResume.single("resume"), createApplication);

// RBAC CHANGE: Protect application viewing, status updates, and deletion.
router.get(
  "/",
  requireAuth,
  requirePermission("applications", "view"),
  getApplications
);

router.put(
  "/:id/status",
  requireAuth,
  requirePermission("applications", "edit"),
  updateApplicationStatus
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("applications", "delete"),
  deleteApplication
);

export default router;
