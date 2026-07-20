"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import JoditEditor from "jodit-react";
import { hasPermission } from "../utils/permissions";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const initialFormState = {
  title: "",
  slug: "",
  date: "",
  status: "Published",
  content: "",
  metaTitle: "",
  metaDescription: "",
};

const AdminBlogs = () => {
  const coverImageInputRef = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [coverImageName, setCoverImageName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(editingBlogId);

  const canCreate = hasPermission("blogs", "create");
  const canEdit = hasPermission("blogs", "edit");
  const canDelete = hasPermission("blogs", "delete");

  const getAuthHeaders = (jsonHeaders = false) => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      ...(jsonHeaders
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  // Configure the rich text editor for blog writing.
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 430,
      placeholder: "Enter blog content",
      toolbarAdaptive: false,
      toolbarSticky: true,

      // Pasted content will be inserted as plain text only.
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_only_text",

      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "font",
        "fontsize",
        "paragraph",
        "|",
        "brush",
        "background",
        "|",
        "ul",
        "ol",
        "indent",
        "outdent",
        "|",
        "align",
        "|",
        "link",
        "image",
        "table",
        "|",
        "hr",
        "eraser",
        "|",
        "undo",
        "redo",
        "|",
        "fullsize",
      ],

      controls: {
        fontsize: {
          list: [
            "12",
            "14",
            "16",
            "18",
            "20",
            "22",
            "24",
            "28",
            "32",
            "36",
          ],
        },
      },
    }),
    []
  );

  // Fetch all blogs from the backend.
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/blogs`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load blogs"
        );
      }

      setBlogs(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load blogs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Create a clean URL slug from the blog title.
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Clear all form values and image preview.
  const resetForm = () => {
    setFormData(initialFormState);

    setCoverImageFile(null);
    setCoverImagePreview("");
    setCoverImageName("");

    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  // Open the modal for adding a new blog.
  const openAddModal = () => {
    setEditingBlogId(null);

    resetForm();

    setMessage("");
    setError("");

    setIsModalOpen(true);
  };

  // Close the modal and reset the form.
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlogId(null);

    resetForm();
  };

  // Update form fields and auto-generate the slug when the title changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "title") {
      setFormData((current) => ({
        ...current,
        title: value,
        slug: createSlug(value),
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Validate and preview the selected cover image.
  const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      );

      setCoverImageFile(null);
      setCoverImagePreview("");
      setCoverImageName("");

      event.target.value = "";

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "File too large. Maximum size allowed is 10MB."
      );

      setCoverImageFile(null);
      setCoverImagePreview("");
      setCoverImageName("");

      event.target.value = "";

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setError("");

      setCoverImageFile(file);
      setCoverImagePreview(reader.result);
      setCoverImageName(file.name);
    };

    reader.readAsDataURL(file);
  };

  // Save a new blog or update an existing blog through the backend API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.date
    ) {
      setError("Title, slug, and date are required.");
      return;
    }

    if (!formData.content.trim()) {
      setError("Blog content is required.");
      return;
    }

    if (!isEditing && !coverImageFile) {
      setError("Blog cover image is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("slug", formData.slug);
      payload.append("date", formData.date);
      payload.append("status", formData.status);
      payload.append("content", formData.content);

      // SEO fields.
      payload.append("metaTitle", formData.metaTitle);
      payload.append(
        "metaDescription",
        formData.metaDescription
      );

      // Send the image only when a new image is selected.
      if (coverImageFile) {
        payload.append("coverImage", coverImageFile);
      }

      const url = isEditing
        ? `${API_BASE}/api/blogs/${editingBlogId}`
        : `${API_BASE}/api/blogs`;

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
            (isEditing
              ? "Failed to update blog"
              : "Failed to create blog")
        );
      }

      closeModal();

      setMessage(
        data?.message ||
          (isEditing
            ? "Blog updated successfully."
            : "Blog created successfully.")
      );

      await fetchBlogs();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

const handleEdit = async (blog) => {
  try {
    setMessage("");
    setError("");

    const response = await fetch(
      `${API_BASE}/api/blogs/admin/${blog._id}`,
      {
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    const fullBlog = await response.json();

    if (!response.ok) {
      throw new Error(
        fullBlog?.message || "Failed to load blog details"
      );
    }

    setEditingBlogId(fullBlog._id);

    setFormData({
      title: fullBlog.title || "",
      slug: fullBlog.slug || "",
      date: fullBlog.date || "",
      status: fullBlog.status || "Published",
      content: fullBlog.content || "",
      metaTitle: fullBlog.metaTitle || "",
      metaDescription: fullBlog.metaDescription || "",
    });

    setCoverImageFile(null);

    setCoverImagePreview(
      fullBlog.coverImage || ""
    );

    setCoverImageName(
      fullBlog.coverImage
        ? "Current uploaded image"
        : ""
    );

    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }

    setMessage("");
    setError("");
    setIsModalOpen(true);
  } catch (editError) {
    setError(
      editError instanceof Error
        ? editError.message
        : "Failed to load blog details"
    );
  }
};

  // Delete the selected blog through the backend API.
  const handleDelete = async (blogId) => {
    const confirmed =
      window.confirm("Delete this blog?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/blogs/${blogId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete blog"
        );
      }

      setMessage(
        data?.message ||
          "Blog deleted successfully."
      );

      setBlogs((currentBlogs) =>
        currentBlogs.filter(
          (blog) => blog._id !== blogId
        )
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete blog"
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">
          Blogs
        </h1>

        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Add Blog
          </button>
        )}
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
        <table className="w-full min-w-[950px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">
                S.No
              </th>

              <th className="px-4 py-4 text-sm">
                Image
              </th>

              <th className="px-4 py-4 text-sm">
                Title
              </th>

              <th className="px-4 py-4 text-sm">
                Slug
              </th>

              <th className="px-4 py-4 text-sm">
                Date
              </th>

              <th className="px-4 py-4 text-sm">
                Status
              </th>

              <th className="px-4 py-4 text-sm">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading blogs...
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No blogs added yet.
                </td>
              </tr>
            ) : (
              blogs.map((blog, index) => (
                <tr
                  key={blog._id}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4">
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      width={96}
                      height={56}
                      className="h-14 w-24 rounded-lg object-cover"
                    />
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {blog.title}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {blog.slug}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {blog.date}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        blog.status === "Published"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(blog)
                        }
                        className="mr-2 rounded-full bg-[#111c2e]/10 px-4 py-2 text-xs font-bold text-[#111c2e] transition hover:bg-[#111c2e] hover:text-white"
                      >
                        Edit
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(blog._id)
                        }
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[4px] text-orange-500">
                  {isEditing
                    ? "Edit Blog"
                    : "Add Blog"}
                </p>

                <h2 className="mt-1 text-[24px] font-bold text-[#111c2e]">
                  {isEditing
                    ? "Update Blog Details"
                    : "Add New Blog"}
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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Blog Title
                  </span>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter blog title"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Slug
                  </span>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="blog-url-slug"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Date
                  </span>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Status
                  </span>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  >
                    <option value="Published">
                      Published
                    </option>

                    <option value="Draft">
                      Draft
                    </option>
                  </select>
                </label>
              </div>

              <div className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                  Blog Cover Image
                </span>

                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <label
                      htmlFor="blogCoverImage"
                      className="cursor-pointer rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Choose File
                    </label>

                    <span className="text-sm text-gray-700">
                      {coverImageName ||
                        "No file chosen"}
                    </span>
                  </div>

                  <input
                    id="blogCoverImage"
                    ref={coverImageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handleCoverImageChange
                    }
                    required={!isEditing}
                    className="hidden"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Recommended size: 1200 , 700px.
                  Max file size: 10MB. JPG, PNG,
                  WEBP only.
                </p>

                {coverImagePreview && (
                  <img
                    src={coverImagePreview}
                    alt="Blog cover preview"
                    className="mt-4 h-56 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                  Blog Content
                </span>

                <div className="overflow-hidden rounded-xl border border-orange-500">
                  <JoditEditor
                    value={formData.content}
                    config={editorConfig}
                    onChange={(newContent) => {
                      setFormData(
                        (current) => ({
                          ...current,
                          content: newContent,
                        })
                      );
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Pasted content will be inserted as
                  plain text only.
                </p>
              </label>

              {/* Search Engine Listing */}
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Search Engine Listing
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Add a custom title and
                    description for search engine
                    results.
                  </p>
                </div>

                <div className="space-y-5 p-4">
                  {/* Search Preview */}
                  <div className="rounded-lg border border-gray-100 bg-white p-4">
                    <p className="mb-3 text-xs text-gray-400">
                      Search Preview
                    </p>

                    <p className="text-xs text-green-700">
                      zmsipl.com {" "}
                      {formData.slug ||
                        "blog-slug"}
                    </p>

                    <p className="mt-1 line-clamp-1 text-[18px] font-medium leading-snug text-blue-600">
                      {formData.metaTitle ||
                        formData.title ||
                        "Blog Meta Title"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                      {formData.metaDescription ||
                        "Meta description will appear here..."}
                    </p>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="metaTitle"
                        className="text-sm font-semibold text-[#111c2e]"
                      >
                        Meta Title
                      </label>

                      <span
                        className={`text-xs ${
                          formData.metaTitle
                            .length > 60
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {
                          formData.metaTitle
                            .length
                        }{" "}
                        / 60
                      </span>
                    </div>

                    <input
                      id="metaTitle"
                      type="text"
                      name="metaTitle"
                      value={
                        formData.metaTitle
                      }
                      onChange={handleChange}
                      placeholder={
                        formData.title ||
                        "Enter SEO meta title"
                      }
                      maxLength={70}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />

                    {formData.metaTitle.length >
                      60 && (
                      <p className="mt-1 text-xs text-red-500">
                        Recommended meta title
                        length is 60 characters or
                        less.
                      </p>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="metaDescription"
                        className="text-sm font-semibold text-[#111c2e]"
                      >
                        Meta Description
                      </label>

                      <span
                        className={`text-xs ${
                          formData
                            .metaDescription
                            .length > 160
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {
                          formData
                            .metaDescription
                            .length
                        }{" "}
                        / 160
                      </span>
                    </div>

                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={
                        formData.metaDescription
                      }
                      onChange={handleChange}
                      placeholder="Enter SEO meta description"
                      rows={4}
                      maxLength={180}
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />

                    {formData.metaDescription
                      .length > 160 && (
                      <p className="mt-1 text-xs text-red-500">
                        Recommended meta
                        description length is 160
                        characters or less.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? isEditing
                      ? "Updating..."
                      : "Saving..."
                    : isEditing
                      ? "Update Blog"
                      : "Save Blog"}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md bg-gray-100 px-6 py-3 text-sm font-bold text-[#111c2e] transition hover:bg-gray-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
