"use client";

import { useEffect, useState } from "react";

import { hasPermission, isSuperAdmin } from "../utils/permissions";

const AccessDenied = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[4px] text-orange-500">
          Access Denied
        </p>
        <h1 className="mt-3 text-[28px] font-bold text-[#111c2e]">
          You do not have permission to view this page.
        </h1>
      </div>
    </div>
  );
};

const PermissionRoute = ({ moduleKey, children }) => {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const canView = isSuperAdmin() || hasPermission(moduleKey, "view");

    setAllowed(canView);
    setChecked(true);
  }, [moduleKey]);

  if (!checked) {
    return null;
  }

  if (!allowed) {
    return <AccessDenied />;
  }

  return children;
};

export default PermissionRoute;