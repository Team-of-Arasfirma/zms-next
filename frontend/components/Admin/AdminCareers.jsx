"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const initialFormState = {
  jobTitle: "",
  department: "",
  location: "",
  jobType: "Full Time",
  experience: "",
  salary: "",
  openPositions: "",
  jobOpenDate: "",
  jobCloseDate: "",
  description: "",
  status: "Active",
};

const AdminCareers = () => {
  const editorRef = useRef(null);

  const [careers, setCareers] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareerId, setEditingCareerId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCreate = hasPermission("careers", "create");
  const canEdit = hasPermission("careers", "edit");
  const canDelete = hasPermission("careers", "delete");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Jodit editor configuration for job description.
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 320,
      placeholder: "Enter job description, responsibilities, and requirements",
      toolbarAdaptive: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_only_text",
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "align",
        "|",
        "link",
        "image",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "fullsize",
      ],
    }),
    []
  );

  // Fetch all jobs from the backend.
  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/careers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load jobs");
      }

      setCareers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  // Open add job popup.
  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingCareerId(null);
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Close popup and reset form.
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCareerId(null);
    setFormData(initialFormState);
    setMessage("");
    setError("");
  };

  // Update normal form input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSalaryChange = (event) => {
    const { value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      salary: value,
    }));
  };

  const formatSalary = (salary) => {
    if (!salary) return "-";

    const cleanSalary = salary.trim();

    if (cleanSalary.startsWith("\u20b9")) {
      return cleanSalary;
    }

    return `\u20b9 ${cleanSalary}`;
  };

  // Format date for admin table.
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Create or update job.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.jobTitle.trim() ||
      !formData.department.trim() ||
      !formData.location.trim() ||
      !formData.description.trim()
    ) {
      setError("Job title, department, location, and description are required.");
      return;
    }

    try {
      setSubmitting(true);

      const url = editingCareerId
        ? `${API_BASE}/api/careers/${editingCareerId}`
        : `${API_BASE}/api/careers`;

      const method = editingCareerId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save job");
      }

      setMessage(data?.message || "Job saved successfully.");
      await fetchCareers();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fill popup form for editing.
  const handleEdit = (career) => {
    setEditingCareerId(career._id);

    setFormData({
      jobTitle: career.jobTitle || "",
      department: career.department || "",
      location: career.location || "",
      jobType: career.jobType || "Full Time",
      experience: career.experience || "",
      salary: career.salary || "",
      openPositions: career.openPositions || "",
      jobOpenDate: career.jobOpenDate || "",
      jobCloseDate: career.jobCloseDate || "",
      description: career.description || "",
      status: career.status || "Active",
    });

    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Delete one job.
  const handleDelete = async (careerId) => {
    const confirmed = window.confirm("Delete this job?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/careers/${careerId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete job");
      }

      setCareers((currentCareers) =>
        currentCareers.filter((career) => career._id !== careerId)
      );

      setMessage(data?.message || "Job deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">Careers</h1>

        {/* RBAC CHANGE: Show Add Job button only when careers.create permission is true. */}
        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Add Job
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
        <table className="w-full min-w-[1350px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Job Title</th>
              <th className="px-4 py-4 text-sm">Department</th>
              <th className="px-4 py-4 text-sm">Location</th>
              <th className="px-4 py-4 text-sm">Job Type</th>
              <th className="px-4 py-4 text-sm">Experience</th>
              <th className="px-4 py-4 text-sm">Salary</th>
              <th className="px-4 py-4 text-sm">Open Positions</th>
              <th className="px-4 py-4 text-sm">Open Date</th>
              <th className="px-4 py-4 text-sm">Closing Date</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading jobs...
                </td>
              </tr>
            ) : careers.length === 0 ? (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No jobs added yet.
                </td>
              </tr>
            ) : (
              careers.map((career, index) => (
                <tr key={career._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {career.jobTitle}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {career.department}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {career.location}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {career.jobType || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {career.experience || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatSalary(career.salary)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {career.openPositions || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(career.jobOpenDate)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(career.jobCloseDate)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${career.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {career.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {/* RBAC CHANGE: Show Edit button only when careers.edit permission is true. */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEdit(career)}
                          className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      )}

                      {/* RBAC CHANGE: Show Delete button only when careers.delete permission is true. */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(career._id)}
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

      {/* Add/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-[#111c2e]">
                {editingCareerId ? "Edit Job" : "Add Job"}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Example: Site Engineer"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Example: Engineering"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Example: Coimbatore"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Example: 2 - 4 Years"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Salary
                  </label>

                  <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 focus-within:border-orange-500">
                    <span className="flex items-center bg-gray-100 px-4 text-sm font-bold text-[#111c2e]">
                      &#8377; INR
                    </span>

                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleSalaryChange}
                      placeholder="Example: 20,000 - 30,000"
                      className="w-full px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Open Positions
                  </label>
                  <input
                    type="number"
                    name="openPositions"
                    value={formData.openPositions}
                    onChange={handleChange}
                    placeholder="Example: 3"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Job Open Date
                  </label>
                  <input
                    type="date"
                    name="jobOpenDate"
                    value={formData.jobOpenDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                    Job Closing Date
                  </label>
                  <input
                    type="date"
                    name="jobCloseDate"
                    value={formData.jobCloseDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#111c2e]">
                  Job Description
                </label>

                <div className="overflow-hidden rounded-lg border border-orange-500">
                  <JoditEditor
                    ref={editorRef}
                    value={formData.description}
                    config={editorConfig}
                    onBlur={(newContent) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        description: newContent,
                      }))
                    }
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Pasted content will be inserted as plain text only.
                </p>
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
                    : editingCareerId
                      ? "Update Job"
                      : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCareers;