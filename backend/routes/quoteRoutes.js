import express from "express";

import {
  createQuote,
  deleteQuote,
  getQuotes,
  updateQuoteStatus,
} from "../controllers/quoteController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Create a new quote inquiry from the public website
router.post("/", createQuote);

// RBAC CHANGE: Protect inquiry viewing, status updates, and deletion.
router.get(
  "/",
  requireAuth,
  requirePermission("inquiries", "view"),
  getQuotes
);

router.put(
  "/:id/status",
  requireAuth,
  requirePermission("inquiries", "edit"),
  updateQuoteStatus
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("inquiries", "delete"),
  deleteQuote
);

export default router;
