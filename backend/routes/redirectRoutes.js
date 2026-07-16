import express from "express";

import {
  createRedirect,
  deleteRedirect,
  getRedirects,
  updateRedirect,
} from "../controllers/redirectController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get("/", getRedirects);

// RBAC CHANGE: Protect redirect create, update, and delete actions.
router.post(
  "/",
  requireAuth,
  requirePermission("redirects", "create"),
  createRedirect
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("redirects", "edit"),
  updateRedirect
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("redirects", "delete"),
  deleteRedirect
);

export default router;
