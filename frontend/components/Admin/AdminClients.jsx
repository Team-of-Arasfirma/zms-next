"use client";
import { useEffect, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const initialFormState = {
  clientName: "",
  order: "",
  status: "Active",
};

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCreate = hasPermission("clients", "create");
  const canEdit = hasPermission("clients", "edit");
  const canDelete = hasPermission("clients", "delete");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch all clients from backend.
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/clients`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load clients");
      }

      setClients(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Open add client popup.
  const openAddModal = () => {
    setFormData(initialFormState);
    setLogoFile(null);
    setLogoPreview("");
    setEditingClientId(null);
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Close popup and reset form.
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setLogoFile(null);
    setLogoPreview("");
    setEditingClientId(null);
    setMessage("");
    setError("");
  };

  // Update normal input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Store selected logo and show preview.
  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setLogoFile(null);
      setLogoPreview("");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Create or update client.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.clientName.trim()) {
      setError("Client name is required.");
      return;
    }

    if (!editingClientId && !logoFile) {
      setError("Client logo is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("clientName", formData.clientName);
      payload.append("order", formData.order);
      payload.append("status", formData.status);

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      const url = editingClientId
        ? `${API_BASE}/api/clients/${editingClientId}`
        : `${API_BASE}/api/clients`;

      const method = editingClientId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save client");
      }

      setMessage(data?.message || "Client saved successfully.");
      await fetchClients();

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
  const handleEdit = (client) => {
    setEditingClientId(client._id);

    setFormData({
      clientName: client.clientName || "",
      order: client.order || "",
      status: client.status || "Active",
    });

    setLogoFile(null);
    setLogoPreview(client.logo || "");
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Delete client.
  const handleDelete = async (clientId) => {
    const confirmed = window.confirm("Delete this client?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/clients/${clientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete client");
      }

      setClients((currentClients) =>
        currentClients.filter((client) => client._id !== clientId)
      );

      setMessage(data?.message || "Client deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">Clients</h1>

        {/* RBAC CHANGE: Show Add Client Logo button only when clients.create permission is true. */}
        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Add Client Logo
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
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Client Name</th>
              <th className="px-4 py-4 text-sm">Logo</th>
              <th className="px-4 py-4 text-sm">Order</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading clients...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No clients added yet.
                </td>
              </tr>
            ) : (
              clients.map((client, index) => (
                <tr key={client._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {client.clientName || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {client.logo ? (
                      <img
                        src={client.logo}
                        alt={client.clientName}
                        className="h-14 w-24 rounded-lg border border-gray-100 object-contain p-2"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {client.order || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${client.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {client.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {/* RBAC CHANGE: Show Edit button only when clients.edit permission is true. */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEdit(client)}
                          className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      )}

                      {/* RBAC CHANGE: Show Delete button only when clients.delete permission is true. */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(client._id)}
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

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-[620px] rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-[#111c2e]">
                {editingClientId ? "Edit Client" : "Add Client"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-gray-100 px-3 py-1 text-xl font-bold text-gray-600 hover:bg-gray-200"
              >
                X
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
                  Client Name
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Example: ABC Industries"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="Example: 1"
                    min="1"
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                  Client Logo
                </label>

                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-center transition hover:border-orange-500">
                  <input
                    type="file"
                    name="logo"
                    accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Client logo preview"
                      className="h-20 w-36 object-contain"
                    />
                  ) : (
                    <>
                      <span className="text-3xl text-gray-400"><i className="ti ti-photo"></i></span>
                      <span className="mt-2 text-sm font-bold text-orange-500">
                        Upload Client Logo
                      </span>
                      <span className="mt-1 text-xs text-gray-400">
                        PNG, JPG, WEBP, SVG allowed
                      </span>
                    </>
                  )}
                </label>
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
                    : editingClientId
                      ? "Update Client"
                      : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
