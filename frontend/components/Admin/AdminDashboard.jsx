"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    blogs: 0,
    products: 0,
    projects: 0,
    careers: 0,
    applications: 0,
    inquiries: 0,
    clients: 0,
    redirects: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Convert API response into array safely.
  const getArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.quotes)) {
      return data.quotes;
    }

    if (Array.isArray(data?.applications)) {
      return data.applications;
    }

    return [];
  };

  // Convert API response into count safely.
  const getCount = (data) => {
    return getArray(data).length;
  };

  // Fetch one endpoint safely.
  const fetchData = async (endpoint, requiresAuth = false) => {
    // RBAC CHANGE: Applications and inquiries endpoints now require admin auth headers.
    const headers = requiresAuth
      ? {
          Authorization: `Bearer ${localStorage.getItem("zmsAdminToken")}`,
        }
      : undefined;

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Failed to load ${endpoint}`);
    }

    return data;
  };

  // Fetch dashboard data.
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const canViewApplications = hasPermission("applications", "view");
      const canViewInquiries = hasPermission("inquiries", "view");

      const [
        blogsData,
        productsData,
        projectsData,
        careersData,
        applicationsData,
        inquiriesData,
        clientsData,
      ] = await Promise.all([
        fetchData("/api/blogs"),
        fetchData("/api/products"),
        fetchData("/api/projects"),
        fetchData("/api/careers"),

        // RBAC CHANGE: Skip protected dashboard panels when the user cannot view them.
        canViewApplications
          ? fetchData("/api/applications", true)
          : Promise.resolve([]),

        // RBAC CHANGE: Inquiries are protected admin data, so token is required.
        canViewInquiries ? fetchData("/api/quotes", true) : Promise.resolve([]),

        fetchData("/api/clients"),
      ]);

      const applicationsArray = getArray(applicationsData);
      const inquiriesArray = getArray(inquiriesData);

      setCounts({
        blogs: getCount(blogsData),
        products: getCount(productsData),
        projects: getCount(projectsData),
        careers: getCount(careersData),
        applications: getCount(applicationsData),
        inquiries: getCount(inquiriesData),
        clients: getCount(clientsData),
        redirects: 0,
      });

      setRecentApplications(applicationsArray.slice(0, 5));
      setRecentInquiries(inquiriesArray.slice(0, 5));
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Blogs",
      value: counts.blogs,
      path: "/admin/blogs",
      color: "bg-blue-500",
    },
    {
      title: "Total Products",
      value: counts.products,
      path: "/admin/products",
      color: "bg-green-500",
    },
    {
      title: "Total Projects",
      value: counts.projects,
      path: "/admin/projects",
      color: "bg-purple-500",
    },
    {
      title: "Total Careers",
      value: counts.careers,
      path: "/admin/careers",
      color: "bg-orange-500",
    },
    {
      title: "Applications",
      value: counts.applications,
      path: "/admin/applications",
      color: "bg-pink-500",
    },
    {
      title: "Inquiries",
      value: counts.inquiries,
      path: "/admin/inquiries",
      color: "bg-red-500",
    },
    {
      title: "Clients",
      value: counts.clients,
      path: "/admin/clients",
      color: "bg-cyan-500",
    },
    {
      title: "Redirects",
      value: counts.redirects,
      path: "/admin/redirects",
      color: "bg-slate-500",
    },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">
          Dashboard Overview
        </h1>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="w-fit rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Cards section */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-gray-500">
                {item.title}
              </p>

              <h2 className="mt-2 text-[36px] font-bold text-[#111c2e]">
                {loading ? "..." : item.value}
              </h2>
            </div>

            <Link
              href={item.path}
              className={`${item.color} block py-3 text-center text-sm font-bold text-white transition hover:opacity-90`}
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Recent activity section */}
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111c2e]">
            Recent Activities
          </h2>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Total Careers:{" "}
              <span className="font-bold text-[#111c2e]">{counts.careers}</span>
            </p>

            <p className="text-sm text-gray-600">
              Total Applications:{" "}
              <span className="font-bold text-[#111c2e]">
                {counts.applications}
              </span>
            </p>

            <p className="text-sm text-gray-600">
              Total Inquiries:{" "}
              <span className="font-bold text-[#111c2e]">
                {counts.inquiries}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111c2e]">
            Recent Applications
          </h2>

          <div className="mt-4 space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-sm text-gray-500">No applications yet.</p>
            ) : (
              recentApplications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-lg bg-gray-50 px-4 py-3"
                >
                  <p className="text-sm font-bold text-[#111c2e]">
                    {application.fullName ||
                      application.name ||
                      application.candidateName ||
                      "-"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {application.jobTitle ||
                      application.position ||
                      application.role ||
                      application.email ||
                      "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-[#111c2e]">
    Recent Inquiries
  </h2>

  <div className="mt-4 space-y-3">
    {recentInquiries.length === 0 ? (
      <p className="text-sm text-gray-500">No inquiries yet.</p>
    ) : (
      recentInquiries.map((inquiry) => {
        // RBAC CHANGE: Show inquiry name using actual quote DB field names.
        const inquiryName =
          inquiry.companyName ||
          inquiry.inquiryName ||
          inquiry.name ||
          "-";

        // RBAC CHANGE: Show quote details using actual quote DB field names.
        const inquiryDetails = [
          inquiry.callNumber ? `Call: ${inquiry.callNumber}` : "",
          inquiry.mountType ? `Mount: ${inquiry.mountType}` : "",
          inquiry.mw ? `MW: ${inquiry.mw}` : "",
          inquiry.productName ? `Product: ${inquiry.productName}` : "",
          inquiry.status ? `Status: ${inquiry.status}` : "",
        ]
          .filter(Boolean)
          .join(" | ");

        return (
          <div
            key={inquiry._id}
            className="rounded-lg bg-gray-50 px-4 py-3"
          >
            <p className="text-sm font-bold text-[#111c2e]">
              {inquiryName}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {inquiryDetails || "No details"}
            </p>
          </div>
        );
      })
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default AdminDashboard;