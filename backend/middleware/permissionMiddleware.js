import { hasPermission, isSuperAdminUser } from "../utils/rbac.js";

export const requirePermission = (moduleKey, actionKey) => {
  return (req, res, next) => {
    if (isSuperAdminUser(req.admin)) {
      return next();
    }

    if (!hasPermission(req.admin, moduleKey, actionKey)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

export const requireSuperAdmin = (req, res, next) => {
  if (isSuperAdminUser(req.admin)) {
    return next();
  }

  return res.status(403).json({
    message: "Access denied",
  });
};

export default requirePermission;
