import express from "express";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../controllers/adminUserController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/", getAdminUsers);
router.post("/", createAdminUser);
router.put("/:id", updateAdminUser);
router.delete("/:id", deleteAdminUser);

export default router;
