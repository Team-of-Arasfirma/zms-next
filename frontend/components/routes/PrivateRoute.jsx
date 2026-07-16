"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PrivateRoute = ({ children }) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("zmsAdminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return children;
};

export default PrivateRoute;