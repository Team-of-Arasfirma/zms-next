"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  hasPermission,
  getAdminUser,
  isSuperAdmin,
} from "../utils/permissions";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", moduleKey: "dashboard" },
  { name: "Blogs", path: "/admin/blogs", moduleKey: "blogs" },
  { name: "Products", path: "/admin/products", moduleKey: "products" },
  { name: "Projects", path: "/admin/projects", moduleKey: "projects" },
  { name: "Careers", path: "/admin/careers", moduleKey: "careers" },
  {
    name: "Applications",
    path: "/admin/applications",
    moduleKey: "applications",
  },
  { name: "Inquiries", path: "/admin/inquiries", moduleKey: "inquiries" },
  {
    name: "URL Redirection",
    path: "/admin/redirects",
    moduleKey: "redirects",
  },
  { name: "Clients", path: "/admin/clients", moduleKey: "clients" },
  { name: "Admin Users", path: "/admin/users", moduleKey: "users" },
];

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("zmsAdminToken");
    localStorage.removeItem("zmsAdminLogin");
    localStorage.removeItem("zmsAdminUser");

    router.replace("/admin/login");
  };

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("zmsAdminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const decoded = decodeJwtPayload(token);

    if (!decoded?.exp) {
      handleLogout();
      return;
    }

    const expiryTime = decoded.exp * 1000;
    const remainingTime = expiryTime - Date.now();

    if (remainingTime <= 0) {
      handleLogout();
      return;
    }

    setAdminUser(getAdminUser());
    setAuthorized(true);

    const logoutTimer = window.setTimeout(() => {
      handleLogout();
    }, remainingTime);

    return () => {
      window.clearTimeout(logoutTimer);
    };
  }, [router]);

  const visibleMenuItems = useMemo(() => {
    if (!mounted || !authorized) {
      return [];
    }

    return menuItems.filter((item) => {
      if (item.path === "/admin/users") {
        return isSuperAdmin();
      }

      return isSuperAdmin() || hasPermission(item.moduleKey, "view");
    });
  }, [mounted, authorized]);

  // Keep server render and first client render identical.
  if (!mounted || !authorized) {
    return null;
  }

  return (
    <section className="flex min-h-screen bg-[#f5f6fa] font-['Poppins']">
      <aside className="fixed top-0 bottom-0 left-0 hidden w-[255px] flex-col bg-[#111c2e] text-white md:flex">
        <div className="flex h-[70px] items-center border-b border-white/10 px-6">
          <h1 className="text-[22px] font-bold tracking-wide">ZMS Admin</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {visibleMenuItems.map((item) => {
            const isActive =
              pathname === item.path ||
              pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`block rounded-md px-4 py-3 text-[15px] font-medium transition ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-4 py-3 text-left text-[15px] font-medium text-red-400 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 md:ml-[255px]">
        <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-5 md:px-7">
          <h2 className="text-[18px] font-bold text-[#111c2e] md:text-[20px]">
            Welcome, {adminUser?.name || "Admin"}
          </h2>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-green-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-green-700"
            >
              View Live Website
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-orange-600"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-5 md:p-7">{children}</div>
      </main>
    </section>
  );
};

export default AdminLayout;