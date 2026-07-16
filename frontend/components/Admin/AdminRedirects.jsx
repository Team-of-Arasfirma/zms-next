"use client";
import { useEffect, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const initialFormState = {
  oldUrl: "",
  newUrl: "",
  status: "Active",
};

const AdminRedirects = () => {
  const [redirects, setRedirects] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirectId, setEditingRedirectId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCreate = hasPermission("redirects", "create");
  const canEdit = hasPermission("redirects", "edit");
  const canDelete = hasPermission("redirects", "delete");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch all redirects from backend.
  const fetchRedirects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/redirects`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load redirects");
      }

      setRedirects(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  // Open add popup.
  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingRedirectId(null);
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Close popup.
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingRedirectId(null);
    setMessage("");
    setError("");
  };

  // Update input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Create or update redirect.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.oldUrl.trim() || !formData.newUrl.trim()) {
      setError("Old URL and New URL are required.");
      return;
    }

    try {
      setSubmitting(true);

      const url = editingRedirectId
        ? `${API_BASE}/api/redirects/${editingRedirectId}`
        : `${API_BASE}/api/redirects`;

      const method = editingRedirectId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save redirect");
      }

      setMessage(data?.message || "Redirect saved successfully.");
      await fetchRedirects();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fill form for edit.
  const handleEdit = (redirect) => {
    setEditingRedirectId(redirect._id);

    setFormData({
      oldUrl: redirect.oldUrl || "",
      newUrl: redirect.newUrl || "",
      status: redirect.status || "Active",
    });

    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Delete redirect.
  const handleDelete = async (redirectId) => {
    const confirmed = window.confirm("Delete this redirect?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/redirects/${redirectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete redirect");
      }

      setRedirects((currentRedirects) =>
        currentRedirects.filter((redirect) => redirect._id !== redirectId)
      );

      setMessage(data?.message || "Redirect deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">
          URL Redirection
        </h1>

        {/* RBAC CHANGE: Show Add Redirect button only when redirects.create permission is true. */}
        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Add Redirect
          </button>
        )}
      </div>

      {(message || error) && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${error
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-green-200 bg-green-50 text-green-700"
            }`}
        >
          {error || message}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Old URL</th>
              <th className="px-4 py-4 text-sm">New URL</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading redirects...
                </td>
              </tr>
            ) : redirects.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No redirects added yet.
                </td>
              </tr>
            ) : (
              redirects.map((redirect, index) => (
                <tr key={redirect._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {redirect.oldUrl}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {redirect.newUrl}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${redirect.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {redirect.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {/* RBAC CHANGE: Show Edit button only when redirects.edit permission is true. */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEdit(redirect)}
                          className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      )}

                      {/* RBAC CHANGE: Show Delete button only when redirects.delete permission is true. */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(redirect._id)}
                          className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Redirect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-[620px] rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-[#111c2e]">
                {editingRedirectId ? "Edit Redirect" : "Add Redirect"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-gray-100 px-3 py-1 text-xl font-bold text-gray-600 hover:bg-gray-200"
              >
                &times;
              </button>
            </div>

            {(message || error) && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${error
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-green-200 bg-green-50 text-green-700"
                  }`}
              >
                {error || message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                  Old URL
                </label>
                <input
                  type="text"
                  name="oldUrl"
                  value={formData.oldUrl}
                  onChange={handleChange}
                  placeholder="Example: /old-page"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                  New URL
                </label>
                <input
                  type="text"
                  name="newUrl"
                  value={formData.newUrl}
                  onChange={handleChange}
                  placeholder="Example: /new-page"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-700">
                Example: <b>/old-url</b> redirect to <b>/new-url</b>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? "Saving..."
                    : editingRedirectId
                      ? "Update Redirect"
                      : "Save Redirect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRedirects;
