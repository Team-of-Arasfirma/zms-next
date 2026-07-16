import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import { normalizePermissions, sanitizeAdminUser } from "../utils/rbac.js";

const router = express.Router();

// Admin login API
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Empty field validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Find admin user from MongoDB
    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // RBAC CHANGE: Block inactive admins from logging in.
    if (admin.isActive === false) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    // Compare typed password with hashed password in DB
    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is missing",
      });
    }

    const user = sanitizeAdminUser(admin);

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions: user.role === "superAdmin" ? {} : user.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// Temporary route to create first admin
// IMPORTANT: After admin created, remove or comment this route.
router.post("/create-admin", async (req, res) => {
  try {
    const { name, username, password, secretKey } = req.body;

    // Extra protection so random people cannot create admin
    if (secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already exists",
      });
    }

    const admin = await Admin.create({
      name: name?.trim() || username.trim(),
      username: username.trim().toLowerCase(),
      password,
      role: "superAdmin",
      permissions: normalizePermissions({}),
    });

    return res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      message: "Server error while creating admin",
    });
  }
});

export default router;
