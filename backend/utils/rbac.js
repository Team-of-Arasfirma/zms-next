export const MAIN_ADMIN_USERNAME = "admin@zms.com";

export const RBAC_MODULES = [
  "dashboard",
  "blogs",
  "products",
  "projects",
  "careers",
  "applications",
  "inquiries",
  "clients",
  "redirects",
  "users",
];

export const RBAC_ACTIONS = ["view", "create", "edit", "delete"];

export const DEFAULT_PERMISSION_VALUE = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

export const createEmptyPermissions = () => {
  return RBAC_MODULES.reduce((permissions, moduleKey) => {
    permissions[moduleKey] = {
      ...DEFAULT_PERMISSION_VALUE,
    };

    return permissions;
  }, {});
};

export const createSuperAdminPermissions = () => {
  return RBAC_MODULES.reduce((permissions, moduleKey) => {
    permissions[moduleKey] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
    };

    return permissions;
  }, {});
};

export const normalizePermissions = (permissions = {}) => {
  const normalizedPermissions = createEmptyPermissions();

  RBAC_MODULES.forEach((moduleKey) => {
    const modulePermissions = permissions?.[moduleKey] || {};

    normalizedPermissions[moduleKey] = {
      view: Boolean(modulePermissions.view),
      create: Boolean(modulePermissions.create),
      edit: Boolean(modulePermissions.edit),
      delete: Boolean(modulePermissions.delete),
    };
  });

  return normalizedPermissions;
};

export const getEffectiveRole = (admin) => {
  const username = admin?.username?.trim().toLowerCase();

  if (admin?.role === "superAdmin" || admin?.role === "staff") {
    return admin.role;
  }

  // RBAC CHANGE: Backward compatibility for existing main admin account.
  if (username === MAIN_ADMIN_USERNAME) {
    return "superAdmin";
  }

  return "staff";
};

export const isSuperAdminUser = (admin) => {
  return getEffectiveRole(admin) === "superAdmin";
};

export const sanitizeAdminUser = (admin) => {
  if (!admin) {
    return null;
  }

  const role = getEffectiveRole(admin);

  return {
    id: admin._id?.toString?.() || admin.id,
    name: admin.name || admin.username || "Admin",
    username: admin.username,
    role,
    permissions: role === "superAdmin" ? {} : normalizePermissions(admin.permissions),
    isActive: admin.isActive !== false,
  };
};

export const hasPermission = (admin, moduleKey, actionKey) => {
  if (!admin) {
    return false;
  }

  if (isSuperAdminUser(admin)) {
    return true;
  }

  if (!RBAC_MODULES.includes(moduleKey) || !RBAC_ACTIONS.includes(actionKey)) {
    return false;
  }

  const permissions = normalizePermissions(admin.permissions);
  return Boolean(permissions[moduleKey]?.[actionKey]);
};

