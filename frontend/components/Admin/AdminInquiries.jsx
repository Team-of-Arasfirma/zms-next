"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [mounted, setMounted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const getAuthHeaders = (jsonHeaders = false) => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      ...(jsonHeaders ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch all quote inquiries from the backend.
  const fetchInquiries = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(`${API_BASE}/api/quotes`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load inquiries");
      }

      setInquiries(Array.isArray(data) ? data : []);
      setError("");
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load inquiries"
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Load permissions only after the component mounts in the browser.
    setMounted(true);
    setCanEdit(hasPermission("inquiries", "edit"));
    setCanDelete(hasPermission("inquiries", "delete"));

    // Initial load with loader.
    fetchInquiries(true);

    // Auto refresh every 10 seconds without showing the loader again.
    const refreshInterval = window.setInterval(() => {
      fetchInquiries(false);
    }, 10000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  // Update the inquiry status.
  const handleStatusChange = async (inquiryId, status) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/quotes/${inquiryId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      setInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) =>
          inquiry._id === inquiryId
            ? { ...inquiry, status }
            : inquiry
        )
      );

      setMessage(data?.message || "Status updated successfully.");
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Failed to update status"
      );
    }
  };

  // Delete one inquiry from the backend.
  const handleDelete = async (inquiryId) => {
    const confirmed = window.confirm("Delete this inquiry?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/quotes/${inquiryId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete inquiry");
      }

      setInquiries((currentInquiries) =>
        currentInquiries.filter(
          (inquiry) => inquiry._id !== inquiryId
        )
      );

      setMessage(data?.message || "Inquiry deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete inquiry"
      );
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <h1 className="text-[26px] font-bold text-[#111c2e]">
        Inquiries
      </h1>

      {(message || error) && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Company</th>
              <th className="px-4 py-4 text-sm">Inquiry Name</th>
              <th className="px-4 py-4 text-sm">Call Number</th>
              <th className="px-4 py-4 text-sm">GST Number</th>
              <th className="px-4 py-4 text-sm">Product</th>
              <th className="px-4 py-4 text-sm">Mount Type</th>
              <th className="px-4 py-4 text-sm">MW</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading inquiries...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No inquiries received yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry, index) => (
                <tr
                  key={inquiry._id}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {inquiry.companyName}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.inquiryName}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.callNumber}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.gstNumber || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.productName || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.mountType}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {inquiry.mw}
                  </td>

                  <td className="px-4 py-4">
                    {canEdit ? (
                      <select
                        value={inquiry.status || "New"}
                        onChange={(event) =>
                          handleStatusChange(
                            inquiry._id,
                            event.target.value
                          )
                        }
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-[#111c2e] outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {inquiry.status || "New"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(inquiry._id)}
                        className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInquiries;