"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import Image from "next/image";

import { hasPermission } from "../utils/permissions";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  status: "Inactive",
  order: "0",
  defaultEnquiryType: "general",
};

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500";

const buttonClass =
  "rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50";

function generateSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function categoryRequest(path = "", options = {}) {
  const isMultipart = options.body instanceof FormData;
  const response = await fetch(
    `${API_BASE}/api/admin/product-categories${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("zmsAdminToken")}`,
        ...(options.body && !isMultipart
          ? { "Content-Type": "application/json" }
          : {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Category operation failed."
    );
  }

  return data;
}

const subscribeToPermissions = (onChange) => {
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
  };
};

const getViewPermission = () =>
  hasPermission("productCategories", "view");

const getServerViewPermission = () => null;

export default function AdminProductCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [allowSlugEdit, setAllowSlugEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef(null);

  const canView = useSyncExternalStore(
    subscribeToPermissions,
    getViewPermission,
    getServerViewPermission
  );

  const canCreate = hasPermission(
    "productCategories",
    "create"
  );

  const canEdit = hasPermission(
    "productCategories",
    "edit"
  );

  const canDelete = hasPermission(
    "productCategories",
    "delete"
  );

  // Load categories
  const loadCategories = useCallback(() => {
    return categoryRequest()
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid category response.");
        }

        setCategories(
          [...data].sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0)
          )
        );
      })
      .catch((loadError) => {
        setError(loadError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (canView) {
      loadCategories();
    }
  }, [canView, loadCategories]);

  useEffect(() => {
    if (!imagePreview.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // Open add/edit form
  const startForm = (category) => {
    if (category ? !canEdit : !canCreate) return;

    if (category) {
      setEditingId(category._id);

      setForm({
        name: String(category.name ?? ""),
        slug: String(category.slug ?? ""),
        description: String(category.description ?? ""),
        status: String(category.status ?? "Inactive"),
        order: String(category.order ?? "0"),
        defaultEnquiryType: category.defaultEnquiryType || "general",
      });
    } else {
      setEditingId(null);
      setForm({ ...emptyForm });
    }

    setAllowSlugEdit(false);
    setImageFile(null);
    setImagePreview(category?.image || "");
    if (imageInputRef.current) imageInputRef.current.value = "";
    setError("");
    setMessage("");
    setOpen(true);
  };

  // Auto-generate slug while creating
  const handleNameChange = (value) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        !editingId && !allowSlugEdit
          ? generateSlug(value)
          : current.slug,
    }));
  };

  // Preview a selected category image. Existing Cloudinary image is not removed.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setError("Only JPG, PNG, or WEBP category images are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Category image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");

  };

  // Save category
  const saveCategory = async (event) => {
    event.preventDefault();

    if (
      busy ||
      (editingId ? !canEdit : !canCreate)
    ) {
      return;
    }

    const order = Number(form.order);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      status: form.status,
      defaultEnquiryType: form.defaultEnquiryType,
      order,
    };

    if (
      !payload.name ||
      payload.name.length > 200
    ) {
      setError(
        "Category name is required (maximum 200 characters)."
      );
      return;
    }

    if (
      !payload.slug ||
      payload.slug.length > 200 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        payload.slug
      )
    ) {
      setError(
        "Invalid slug. Use lowercase letters, numbers and single hyphens."
      );
      return;
    }

    if (
      !form.order.trim() ||
      !Number.isSafeInteger(order) ||
      order < 0
    ) {
      setError(
        "Display order must be a nonnegative whole number."
      );
      return;
    }

    if (
      !["Active", "Inactive"].includes(payload.status)
    ) {
      setError("Invalid category status.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      let body;
      if (imageFile) {
        body = new FormData();
        body.append("name", payload.name);
        body.append("slug", payload.slug);
        body.append("description", payload.description);
        body.append("status", payload.status);
        body.append("order", String(payload.order));
        body.append("defaultEnquiryType", payload.defaultEnquiryType);
        body.append("image", imageFile);
      } else {
        body = JSON.stringify(payload);
      }

      const data = await categoryRequest(
        editingId ? `/${editingId}` : "",
        {
          method: editingId ? "PUT" : "POST",
          body,
        }
      );

      setOpen(false);
      setImageFile(null);
      setImagePreview("");

      setMessage(
        data.message || "Category saved successfully."
      );

      setLoading(true);
      await loadCategories();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  // Delete category
  const deleteCategory = async (category) => {
    if (
      busy ||
      !canDelete ||
      !window.confirm(
        `Delete category "${category.name}"? Categories referenced by products cannot be deleted.`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const data = await categoryRequest(
        `/${category._id}`,
        {
          method: "DELETE",
        }
      );

      setCategories((current) =>
        current.filter(
          (item) => item._id !== category._id
        )
      );

      setMessage(
        data.message || "Category deleted."
      );
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  if (canView === false) {
    return (
      <p role="alert">
        You do not have permission to view product categories.
      </p>
    );
  }

  return (
    <div>
      {/* PAGE HEADING */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">
          Product Categories
        </h1>

        {canView && canCreate && (
          <button
            type="button"
            className={buttonClass}
            onClick={() => startForm()}
          >
            Add Category
          </button>
        )}
      </div>

      {/* ALERTS */}
      {error && !open && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {/* CATEGORY TABLE */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              {[
                "Name",
                "Slug",
                "Description",
                "Image",
                "Order",
                "Status",
                "Actions",
              ].map((title) => (
                <th
                  key={title}
                  scope="col"
                  className="px-4 py-4"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center"
                >
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category._id}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-4 font-semibold text-[#111c2e]">
                    {category.name}
                  </td>

                  <td className="break-all px-4 py-4">
                    {category.slug}
                  </td>

                  <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-4">
                    {category.description || "—"}
                  </td>

                  <td className="px-4 py-4">
                    {category.image ? (
                      <a
                        href={category.image}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-orange-600 underline"
                      >
                        View image
                      </a>
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {category.order}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        category.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            startForm(category)
                          }
                          className="rounded-md bg-gray-100 px-3 py-2 font-semibold disabled:opacity-50"
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            deleteCategory(category)
                          }
                          className="rounded-md bg-red-50 px-3 py-2 font-semibold text-red-600 disabled:opacity-50"
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

      {error && !open && canView && (
        <button
          type="button"
          disabled={loading || busy}
          onClick={() => {
            setError("");
            setLoading(true);
            loadCategories();
          }}
          className="mt-3 text-sm font-semibold text-orange-700 underline disabled:opacity-50"
        >
          Reload categories
        </button>
      )}

      {/* ADD / EDIT MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2
                id="category-title"
                className="text-xl font-bold text-[#111c2e]"
              >
                {editingId
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={() => { setOpen(false); setImageFile(null); setImagePreview(""); }}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <form onSubmit={saveCategory}>
              <fieldset
                disabled={busy}
                className="space-y-4"
              >
                {/* CATEGORY NAME */}
                <label className="block text-sm font-semibold">
                  Category Name

                  <input
                    autoFocus
                    required
                    maxLength={200}
                    className={inputClass}
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="Enter category name"
                  />
                </label>

                {/* AUTO GENERATED SLUG */}
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <label
                      htmlFor="category-slug"
                      className="text-sm font-semibold"
                    >
                      Slug
                    </label>

                    <button
                      type="button"
                      className="text-xs font-semibold text-orange-600 hover:underline"
                      onClick={() =>
                        setAllowSlugEdit(
                          (current) => !current
                        )
                      }
                    >
                      {allowSlugEdit
                        ? "Lock Slug"
                        : "Edit Slug"}
                    </button>
                  </div>

                  <input
                    id="category-slug"
                    required
                    readOnly={!allowSlugEdit}
                    maxLength={200}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    className={`${inputClass} ${
                      !allowSlugEdit
                        ? "bg-gray-50 text-gray-600"
                        : "bg-white"
                    }`}
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value
                          .toLowerCase(),
                      }))
                    }
                    placeholder="auto-generated-slug"
                  />

                  <p className="mt-1 text-xs font-normal text-gray-500">
                    {editingId
                      ? "Existing slug is preserved. Changing it may break old category links."
                      : "Slug is generated automatically from the category name."}
                  </p>
                </div>

                {/* DESCRIPTION */}
                <label className="block text-sm font-semibold">
                  Description

                  <textarea
                    rows={4}
                    className={inputClass}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    placeholder="Category description"
                  />
                </label>

                {/* OPTIONAL CATEGORY IMAGE */}
                <div className="space-y-2">
                  <label
                    htmlFor="category-image"
                    className="block text-sm font-semibold"
                  >
                    Category Image (optional)
                  </label>
                  <input
                    id="category-image"
                    ref={imageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={handleImageChange}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500">
                    JPG, JPEG, PNG or WEBP, maximum 10 MB. Leave unchanged to keep
                    the existing image. Selecting a new file replaces the
                    category image reference after Save.
                  </p>
                  {imageFile && (
                    <p className="break-all text-sm text-gray-600">{imageFile.name}</p>
                  )}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-md border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                    >
                      Replace Image
                    </button>
                  )}
                  {imagePreview && (
                    <Image
                      unoptimized
                      width={800}
                      height={450}
                      src={imagePreview}
                      alt="Category image preview"
                      className="h-44 w-full rounded-xl border border-gray-100 bg-gray-50 object-contain"
                    />
                  )}
                </div>

                <label className="block text-sm font-semibold">
                  Default Enquiry Type
                  <select
                    className={inputClass}
                    value={form.defaultEnquiryType}
                    onChange={(event) => setForm((current) => ({
                      ...current, defaultEnquiryType: event.target.value,
                    }))}
                  >
                    <option value="general">General</option>
                    <option value="solar">Solar</option>
                  </select>
                </label>

                {/* ORDER / STATUS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Display Order

                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      className={inputClass}
                      value={form.order}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          order: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Status

                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="Active">
                        Active
                      </option>
                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  className={buttonClass}
                >
                  {busy
                    ? "Saving..."
                    : editingId
                      ? "Update Category"
                      : "Save Category"}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
