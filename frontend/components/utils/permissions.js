const parseAdminUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem("zmsAdminUser");

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser);

    if (!parsedUser || typeof parsedUser !== "object") {
      return null;
    }

    return parsedUser;
  } catch (error) {
    return null;
  }
};

export const getAdminUser = () => {
  return parseAdminUser();
};

export const isSuperAdmin = () => {
  const user = getAdminUser();

  return user?.role === "superAdmin";
};

export const hasPermission = (moduleKey, actionKey) => {
  const user = getAdminUser();

  if (!user) {
    return false;
  }

  if (user.role === "superAdmin") {
    return true;
  }

  return Boolean(user.permissions?.[moduleKey]?.[actionKey]);
};