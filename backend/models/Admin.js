import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import {
  createEmptyPermissions,
  getEffectiveRole,
  isSuperAdminUser,
  normalizePermissions,
} from "../utils/rbac.js";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["superAdmin", "staff"],
      default: "staff",
    },

    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: createEmptyPermissions,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function adminPreSave(next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.role === "superAdmin") {
    this.permissions = {};
  } else {
    this.permissions = normalizePermissions(this.permissions);
  }

  if (!this.name?.trim()) {
    this.name = this.username;
  }

  next();
});

adminSchema.methods.getEffectiveRole = function getAdminEffectiveRole() {
  return getEffectiveRole(this);
};

adminSchema.methods.isSuperAdmin = function isAdminSuperAdmin() {
  return isSuperAdminUser(this);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
