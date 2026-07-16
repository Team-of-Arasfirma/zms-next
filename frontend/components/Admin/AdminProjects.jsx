"use client";
import { useEffect, useRef, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialFormState = {
  title: "",
  capacity: "",
  location: "",
  status: "Completed",
};

const AdminProjects = () => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Popup open / close state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store the selected project ID while editing
  const [editingProjectId, setEditingProjectId] = useState(null);
  const isEditing = Boolean(editingProjectId);
  const canCreate = hasPermission("projects", "create");
  const canEdit = hasPermission("projects", "edit");
  const canDelete = hasPermission("projects", "delete");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/projects`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load projects");
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const totalProjects = projects.length;

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    setEditingProjectId(null);
    resetForm();
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProjectId(null);
    resetForm();
  };

  // Fill the form with selected project data when Edit is clicked
  const handleEdit = (project) => {
    setMessage("");
    setError("");

    setEditingProjectId(project._id);

    setFormData({
      title: project.title || "",
      capacity: project.capacity || "",
      location: project.location || "",
      status: project.status || "Completed",
    });

    setImageFile(null);

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    // Show the existing uploaded image in the preview
    setImagePreview(project.image || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      setImageFile(null);
      setImagePreview("");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("File too large. Maximum size allowed is 10MB.");
      setImageFile(null);
      setImagePreview("");
      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.title.trim() ||
      !formData.capacity.trim() ||
      !formData.location.trim()
    ) {
      setError("Project title, capacity, and location are required.");
      return;
    }

    // Image is required only when adding a new project
    // In edit mode, the image is optional. If no new image is selected, the old image will remain unchanged.
    if (!isEditing && !imageFile) {
      setError("Please select a project image.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("capacity", formData.capacity);
      payload.append("location", formData.location);
      payload.append("status", formData.status);

      // Send the new image only if the admin selected one
      if (imageFile) {
        payload.append("image", imageFile);
      }

      const url = isEditing
        ? `${API_BASE}/api/projects/${editingProjectId}`
        : `${API_BASE}/api/projects`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          (isEditing ? "Failed to update project" : "Failed to upload project")
        );
      }

      setMessage(
        data?.message ||
        (isEditing
          ? "Project updated successfully."
          : "Project uploaded successfully.")
      );

      closeModal();
      await fetchProjects();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm("Delete this project?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete project");
      }

      setMessage(data?.message || "Project deleted successfully.");

      setProjects((current) =>
        current.filter((project) => project._id !== projectId)
      );
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Poppins] text-[12px] font-semibold uppercase tracking-[5px] text-[#ff6b2c]">
            Projects
          </p>
          <h1 className="font-[Bebas_Neue] text-[44px] leading-none text-[#1d2b3a] md:text-[56px]">
            Project Management
          </h1>
          <p className="mt-2 max-w-2xl font-[Lato] text-[15px] leading-relaxed text-gray-600">
            Manage ZMS project details. Newly added projects will appear first
            on the public project page.
          </p>
        </div>

        {/* RBAC CHANGE: Show Add Project button only when projects.create permission is true. */}
        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-full bg-[#ff6b2c] px-6 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
          >
            Add Project
          </button>
        )}
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-5 py-4 font-[Poppins] text-sm ${error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700"
            }`}
        >
          {error || message}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(29,43,58,0.08)]">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[Bebas_Neue] text-[34px] leading-none text-[#1d2b3a]">
              Uploaded Projects
            </h2>
          </div>

          <p className="font-[Poppins] text-sm font-medium text-gray-600">
            Total: {totalProjects}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#1d2b3a] text-white">
              <tr>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Image
                </th>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Title
                </th>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Capacity
                </th>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Location
                </th>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Status
                </th>
                <th className="px-5 py-4 font-[Poppins] text-xs font-semibold uppercase tracking-[2px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center font-[Poppins] text-sm text-gray-500"
                  >
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center font-[Poppins] text-sm text-gray-500"
                  >
                    No projects added yet.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-16 w-24 rounded-xl object-cover"
                      />
                    </td>

                    <td className="px-5 py-4 font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                      {project.title}
                    </td>

                    <td className="px-5 py-4 font-[Poppins] text-sm text-gray-600">
                      {project.capacity}
                    </td>

                    <td className="px-5 py-4 font-[Poppins] text-sm text-gray-600">
                      {project.location}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-[Poppins] text-xs font-semibold ${project.status === "Completed"
                          ? "bg-[#ff6b2c]/10 text-[#ff6b2c]"
                          : project.status === "Ongoing"
                            ? "bg-[#1d2b3a]/10 text-[#1d2b3a]"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {project.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {/* RBAC CHANGE: Show Edit Project button only when projects.edit permission is true. */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                          className="mr-2 rounded-full bg-[#1d2b3a]/10 px-4 py-2 font-[Poppins] text-xs font-semibold text-[#1d2b3a] transition hover:bg-[#1d2b3a] hover:text-white"
                        >
                          Edit
                        </button>
                      )}

                      {/* RBAC CHANGE: Show Delete Project button only when projects.delete permission is true. */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(project._id)}
                          className="rounded-full bg-red-50 px-4 py-2 font-[Poppins] text-xs font-semibold text-red-600 transition hover:bg-red-100"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-[Poppins] text-[12px] font-semibold uppercase tracking-[5px] text-[#ff6b2c]">
                  {isEditing ? "Edit Project" : "Add Project"}
                </p>
                <h2 className="font-[Bebas_Neue] text-[38px] leading-none text-[#1d2b3a]">
                  {isEditing ? "Update Project Details" : "Add New Project"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-gray-100 px-4 py-2 font-[Poppins] text-sm font-semibold text-[#1d2b3a] transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                      Project Title
                    </span>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter project title"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 font-[Lato] text-[#1d2b3a] outline-none transition focus:border-[#ff6b2c]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                      Capacity / MW
                    </span>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      placeholder='Example: "130MW"'
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 font-[Lato] text-[#1d2b3a] outline-none transition focus:border-[#ff6b2c]"
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                      Location
                    </span>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="Enter project location"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 font-[Lato] text-[#1d2b3a] outline-none transition focus:border-[#ff6b2c]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                      Status
                    </span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 font-[Lato] text-[#1d2b3a] outline-none transition focus:border-[#ff6b2c]"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block font-[Poppins] text-sm font-medium text-[#1d2b3a]">
                    Project Image Upload
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    required={!isEditing}
                    className="w-full rounded-2xl border border-dashed border-gray-300 bg-[#f9fafb] px-4 py-3 font-[Lato] text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#1d2b3a] file:px-4 file:py-2 file:font-[Poppins] file:text-sm file:font-semibold file:text-white hover:file:bg-[#ff6b2c]"
                  />

                  <p className="mt-2 font-[Poppins] text-xs text-gray-500">
                    {isEditing
                      ? "If no new image is selected, the old image will remain unchanged."
                      : "Recommended size: 1200 &times; 800px. Max file size: 10MB. JPG, PNG, WEBP only."}
                  </p>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-full bg-[#ff6b2c] px-6 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting
                      ? isEditing
                        ? "Updating..."
                        : "Saving..."
                      : isEditing
                        ? "Update Project"
                        : "Save Project"}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center justify-center rounded-full bg-gray-100 px-6 py-3 font-[Poppins] text-sm font-semibold text-[#1d2b3a] transition hover:bg-gray-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <div className="rounded-[24px] bg-[#1d2b3a] p-5 text-white shadow-[0_18px_40px_rgba(29,43,58,0.2)]">
                <p className="font-[Poppins] text-xs uppercase tracking-[5px] text-[#ffb38d]">
                  Image Preview
                </p>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Project preview"
                      className="h-[320px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center px-8 text-center font-[Lato] text-sm leading-relaxed text-white/70">
                      Choose a project image to preview it here before uploading.
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 text-sm font-[Poppins] text-white/80">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>Projects in database</span>
                    <span className="font-semibold text-white">
                      {totalProjects}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>Mode</span>
                    <span className="font-semibold text-white">
                      {isEditing ? "Editing project" : "Adding new project"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Latest upload</span>
                    <span className="font-semibold text-white">
                      Shown first on site
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-[Poppins] text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
