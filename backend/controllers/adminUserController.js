import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import {
  getEffectiveRole,
  isSuperAdminUser,
  normalizePermissions,
  sanitizeAdminUser,
} from "../utils/rbac.js";

const getSafeAdminListItem = (admin) => {
  const sanitized = sanitizeAdminUser(admin);

  return {
    ...sanitized,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
};

const countSuperAdmins = async () => {
  return Admin.countDocuments({
    $or: [
      { role: "superAdmin" },
      { username: "admin@zms.com" },
    ],
    isActive: true,
  });
};

export const getAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });

    return res.status(200).json(
      admins.map((admin) => getSafeAdminListItem(admin))
    );
  } catch (error) {
    console.error("Get Admin Users Error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin users",
    });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, username, password, role, permissions, isActive } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        message: "Name, username, and password are required",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const existingAdmin = await Admin.findOne({ username: trimmedUsername });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin username already exists",
      });
    }

    const adminRole = role === "superAdmin" ? "superAdmin" : "staff";
    const adminPermissions =
      adminRole === "superAdmin" ? {} : normalizePermissions(permissions);

    const admin = await Admin.create({
      name: name.trim(),
      username: trimmedUsername,
      password,
      role: adminRole,
      permissions: adminPermissions,
      isActive: isActive !== false,
    });

    return res.status(201).json({
      message: "Admin user created successfully",
      user: getSafeAdminListItem(admin),
    });
  } catch (error) {
    console.error("Create Admin User Error:", error);

    return res.status(500).json({
      message: "Failed to create admin user",
    });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role, permissions, isActive } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin user not found",
      });
    }

    const trimmedUsername = username?.trim().toLowerCase();

    if (trimmedUsername && trimmedUsername !== admin.username) {
      const duplicateAdmin = await Admin.findOne({
        username: trimmedUsername,
        _id: { $ne: id },
      });

      if (duplicateAdmin) {
        return res.status(409).json({
          message: "Admin username already exists",
        });
      }

      admin.username = trimmedUsername;
    }

    if (name?.trim()) {
      admin.name = name.trim();
    }

    if (password?.trim()) {
      admin.password = password.trim();
    }

    const nextRole = role === "superAdmin" ? "superAdmin" : "staff";

    if (admin.role === "superAdmin" && nextRole !== "superAdmin") {
      const superAdminCount = await countSuperAdmins();

      if (superAdminCount <= 1) {
        return res.status(400).json({
          message: "Cannot remove the last superAdmin",
        });
      }
    }

    admin.role = nextRole;
    admin.permissions =
      nextRole === "superAdmin" ? {} : normalizePermissions(permissions);

    if (typeof isActive === "boolean") {
      admin.isActive = isActive;
    }

    await admin.save();

    return res.status(200).json({
      message: "Admin user updated successfully",
      user: getSafeAdminListItem(admin),
    });
  } catch (error) {
    console.error("Update Admin User Error:", error);

    return res.status(500).json({
      message: "Failed to update admin user",
    });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.admin?._id?.toString() === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin user not found",
      });
    }

    if (getEffectiveRole(admin) === "superAdmin") {
      const superAdminCount = await countSuperAdmins();

      if (superAdminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last superAdmin",
        });
      }
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Delete Admin User Error:", error);

    return res.status(500).json({
      message: "Failed to delete admin user",
    });
  }
};
