"use client";

﻿import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const modules = [
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

const defaultPermissions = modules.reduce((permissions, moduleKey) => {
  permissions[moduleKey] = {
    view: false,
    create: false,
    edit: false,
    delete: false,
  };

  return permissions;
}, {});

const emptyForm = {
  name: "",
  username: "",
  password: "",
  role: "staff",
  isActive: true,
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("zmsAdminToken") || "";
  };

  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setPermissions(defaultPermissions);
    setEditingId(null);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/admin-users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load admin users");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    resetForm();
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setMessage("");
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePermissionChange = (moduleKey, actionKey, value) => {
    setPermissions((current) => ({
      ...current,
      [moduleKey]: {
        ...current[moduleKey],
        [actionKey]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.username.trim()) {
      setError("Name and username are required.");
      return;
    }

    if (!editingId && !formData.password.trim()) {
      setError("Password is required for new users.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const payload = {
        name: formData.name,
        username: formData.username,
        role: formData.role,
        permissions,
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const url = editingId
        ? `${API_BASE}/api/admin-users/${editingId}`
        : `${API_BASE}/api/admin-users`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save admin user");
      }

      setMessage(data?.message || "Admin user saved successfully.");
      await fetchUsers();
      closeModal();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id || user._id);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: user.role || "staff",
      isActive: user.isActive !== false,
    });
    setPermissions({
      ...defaultPermissions,
      ...(user.permissions || {}),
    });
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Delete this admin user?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/admin-users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete admin user");
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => (user.id || user._id) !== userId)
      );

      setMessage(data?.message || "Admin user deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#111c2e]">Admin Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage staff access and permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Add User
        </button>
      </div>

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
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">Name</th>
              <th className="px-4 py-4 text-sm">Username</th>
              <th className="px-4 py-4 text-sm">Role</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Loading admin users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No admin users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id || user._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {user.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {user.username}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {user.role}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.isActive === false
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(user)}
                      className="mr-2 rounded-full bg-[#111c2e]/10 px-4 py-2 text-xs font-bold text-[#111c2e] transition hover:bg-[#111c2e] hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(user.id || user._id)}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[4px] text-orange-500">
                  {editingId ? "Edit User" : "Add User"}
                </p>
                <h2 className="mt-1 text-[24px] font-bold text-[#111c2e]">
                  {editingId ? "Update Admin User" : "Create Admin User"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-[#111c2e] transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Email / Username
                  </span>
                  <input
                    type="email"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Password
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingId ? "Leave blank to keep current password" : ""}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Role
                  </span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  >
                    <option value="staff">staff</option>
                    <option value="superAdmin">superAdmin</option>
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold text-[#111c2e]">
                  Active
                </span>
              </label>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left">
                    <thead className="bg-[#111c2e] text-white">
                      <tr>
                        <th className="px-4 py-3 text-sm">Module</th>
                        <th className="px-4 py-3 text-sm">View</th>
                        <th className="px-4 py-3 text-sm">Create</th>
                        <th className="px-4 py-3 text-sm">Edit</th>
                        <th className="px-4 py-3 text-sm">Delete</th>
                      </tr>
                    </thead>

                    <tbody>
                      {modules.map((moduleKey) => (
                        <tr key={moduleKey} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-sm font-semibold text-[#111c2e]">
                            {moduleKey}
                          </td>
                          {["view", "create", "edit", "delete"].map((actionKey) => (
                            <td key={actionKey} className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={Boolean(permissions[moduleKey]?.[actionKey])}
                                onChange={(event) =>
                                  handlePermissionChange(
                                    moduleKey,
                                    actionKey,
                                    event.target.checked
                                  )
                                }
                                disabled={formData.role === "superAdmin"}
                                className="h-4 w-4"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Saving..."
                    : editingId
                      ? "Update User"
                      : "Save User"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md bg-gray-100 px-6 py-3 text-sm font-bold text-[#111c2e] transition hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

