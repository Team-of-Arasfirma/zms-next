import express from "express";

import {
  createCareer,
  deleteCareer,
  getCareers,
  updateCareer,
} from "../controllers/careerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Get all jobs.
router.get("/", getCareers);

// RBAC CHANGE: Protect career create, update, and delete actions.
router.post(
  "/",
  requireAuth,
  requirePermission("careers", "create"),
  createCareer
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("careers", "edit"),
  updateCareer
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("careers", "delete"),
  deleteCareer
);

export default router;
