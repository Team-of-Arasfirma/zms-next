import express from "express";
import multer from "multer";

import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../controllers/clientController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { clientStorage } from "../config/cloudinary.js";

const router = express.Router();

const uploadClientLogo = multer({
  storage: clientStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, and SVG images are allowed"));
    }

    cb(null, true);
  },
});

router.get("/", getClients);

// RBAC CHANGE: Protect client create, update, and delete actions.
router.post(
  "/",
  requireAuth,
  requirePermission("clients", "create"),
  uploadClientLogo.single("logo"),
  createClient
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("clients", "edit"),
  uploadClientLogo.single("logo"),
  updateClient
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("clients", "delete"),
  deleteClient
);

export default router;
