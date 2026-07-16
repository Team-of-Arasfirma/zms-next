"use client";
import { useEffect, useRef, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const defaultSpecifications = [
  { label: "Material", value: "" },
  { label: "Steel Grade", value: "" },
  { label: "Coating", value: "" },
  { label: "Thickness", value: "" },
  { label: "Web", value: "" },
  { label: "Flange Width", value: "" },
  { label: "Up Size", value: "" },
  { label: "Length", value: "" },
  { label: "Yield Strength", value: "" },
  { label: "Punching / Holes", value: "" },
  { label: "Structural Shape", value: "" },
  { label: "Weight", value: "" },
];

const initialFormState = {
  name: "",
  thickness: "",
  materialGrade: "",
  order: "1",
  status: "Active",
  description: "",
  specifications: defaultSpecifications,
};

const AdminProducts = () => {
  const productImageInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [productImageName, setProductImageName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(editingProductId);
  const canCreate = hasPermission("products", "create");
  const canEdit = hasPermission("products", "edit");
  const canDelete = hasPermission("products", "delete");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Return a fresh copy of default specifications.
  const getDefaultSpecifications = () => {
    return defaultSpecifications.map((specification) => ({
      ...specification,
    }));
  };

  // Fetch all products from the backend.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load products");
      }

      const sortedProducts = Array.isArray(data)
        ? data.sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        : [];

      setProducts(sortedProducts);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear all form values and image preview.
  const resetForm = () => {
    setFormData({
      ...initialFormState,
      specifications: getDefaultSpecifications(),
    });

    setProductImageFile(null);
    setProductImagePreview("");
    setProductImageName("");

    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
  };

  // Open the modal for adding a new product.
  const openAddModal = () => {
    setEditingProductId(null);
    resetForm();
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Close the modal and reset the form.
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    resetForm();
  };

  // Update product form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Update one specification row.
  const handleSpecificationChange = (index, field, value) => {
    setFormData((current) => {
      const updatedSpecifications = [...current.specifications];

      updatedSpecifications[index] = {
        ...updatedSpecifications[index],
        [field]: value,
      };

      return {
        ...current,
        specifications: updatedSpecifications,
      };
    });
  };

  // Add a new empty specification row.
  const addSpecificationRow = () => {
    setFormData((current) => ({
      ...current,
      specifications: [...current.specifications, { label: "", value: "" }],
    }));
  };

  // Remove one specification row.
  const removeSpecificationRow = (index) => {
    setFormData((current) => ({
      ...current,
      specifications: current.specifications.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  // Validate and preview the selected product image.
  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      setProductImageFile(null);
      setProductImagePreview("");
      setProductImageName("");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("File too large. Maximum size allowed is 10MB.");
      setProductImageFile(null);
      setProductImagePreview("");
      setProductImageName("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setError("");
      setProductImageFile(file);
      setProductImagePreview(reader.result);
      setProductImageName(file.name);
    };

    reader.readAsDataURL(file);
  };

  // Save a new product or update an existing product through the backend API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.name.trim() ||
      !formData.thickness.trim() ||
      !formData.materialGrade.trim()
    ) {
      setError("Product name, thickness, and material grade are required.");
      return;
    }

    if (!formData.order || Number(formData.order) < 1) {
      setError("Product order is required and should be greater than 0.");
      return;
    }

    if (!isEditing && !productImageFile) {
      setError("Product image is required.");
      return;
    }

    const cleanedSpecifications = formData.specifications
      .filter(
        (specification) =>
          specification.label.trim() && specification.value.trim()
      )
      .map((specification) => ({
        label: specification.label.trim(),
        value: specification.value.trim(),
      }));

    if (cleanedSpecifications.length === 0) {
      setError("At least one specification is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("thickness", formData.thickness);
      payload.append("materialGrade", formData.materialGrade);
      payload.append("order", formData.order);
      payload.append("status", formData.status);
      payload.append("description", formData.description);
      payload.append("specifications", JSON.stringify(cleanedSpecifications));

      // Send the image only when a new image is selected.
      if (productImageFile) {
        payload.append("image", productImageFile);
      }

      const url = isEditing
        ? `${API_BASE}/api/products/${editingProductId}`
        : `${API_BASE}/api/products`;

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
            ? "Failed to update product"
            : "Failed to create product")
        );
      }

      closeModal();

      setMessage(
        data?.message ||
        (isEditing
          ? "Product updated successfully."
          : "Product created successfully.")
      );

      await fetchProducts();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fill the form with selected product data when Edit is clicked.
  const handleEdit = (product) => {
    setEditingProductId(product._id);

    setFormData({
      name: product.name || "",
      thickness: product.thickness || "",
      materialGrade: product.materialGrade || "",
      order: String(product.order || "1"),
      status: product.status || "Active",
      description: product.description || "",
      specifications: product.specifications?.length
        ? product.specifications
        : getDefaultSpecifications(),
    });

    setProductImageFile(null);
    setProductImagePreview(product.image || "");
    setProductImageName(product.image ? "Current uploaded image" : "");

    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }

    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  // Delete the selected product through the backend API.
  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete product");
      }

      setMessage(data?.message || "Product deleted successfully.");

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">Products</h1>

        {/* RBAC CHANGE: Show Add Product button only when products.create permission is true. */}
        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Add Product
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

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Image</th>
              <th className="px-4 py-4 text-sm">Product Name</th>
              <th className="px-4 py-4 text-sm">Thickness</th>
              <th className="px-4 py-4 text-sm">Material Grade</th>
              <th className="px-4 py-4 text-sm">Order</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No products added yet.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-14 w-24 rounded-lg object-cover"
                    />
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                    {product.name}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {product.thickness}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {product.materialGrade}
                  </td>

                  <td className="px-4 py-4 text-sm font-bold text-[#111c2e]">
                    {product.order || 1}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${product.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                        }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {/* RBAC CHANGE: Show Edit Product button only when products.edit permission is true. */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="mr-2 rounded-full bg-[#111c2e]/10 px-4 py-2 text-xs font-bold text-[#111c2e] transition hover:bg-[#111c2e] hover:text-white"
                      >
                        Edit
                      </button>
                    )}

                    {/* RBAC CHANGE: Show Delete Product button only when products.delete permission is true. */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
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
                  {isEditing ? "Edit Product" : "Add Product"}
                </p>

                <h2 className="mt-1 text-[24px] font-bold text-[#111c2e]">
                  {isEditing ? "Update Product Details" : "Add New Product"}
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
                    Product Name
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Example: C Purlin"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Product Order
                  </span>

                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="Example: 1"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Thickness
                  </span>

                  <input
                    type="text"
                    name="thickness"
                    value={formData.thickness}
                    onChange={handleChange}
                    required
                    placeholder="Example: 0.8mm - 2.5mm"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                    Material Grade
                  </span>

                  <input
                    type="text"
                    name="materialGrade"
                    value={formData.materialGrade}
                    onChange={handleChange}
                    required
                    placeholder="Example: E350, E550"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
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
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </label>
              </div>

              <div className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                  Product Image
                </span>

                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <label
                      htmlFor="productImage"
                      className="cursor-pointer rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Choose File
                    </label>

                    <span className="text-sm text-gray-700">
                      {productImageName || "No file chosen"}
                    </span>
                  </div>

                  <input
                    id="productImage"
                    ref={productImageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleProductImageChange}
                    required={!isEditing}
                    className="hidden"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Recommended size: 1000 &times; 700px. Max file size: 10MB. JPG,
                  PNG, WEBP only.
                </p>

                {productImagePreview && (
                  <img
                    src={productImagePreview}
                    alt="Product preview"
                    className="mt-4 h-56 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              <div className="block">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="block text-sm font-semibold text-[#111c2e]">
                    Specifications
                  </span>

                  <button
                    type="button"
                    onClick={addSpecificationRow}
                    className="rounded-md bg-[#111c2e] px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500"
                  >
                    Add Specification
                  </button>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {formData.specifications.map((specification, index) => (
                    <div
                      key={index}
                      className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        type="text"
                        value={specification.label}
                        onChange={(event) =>
                          handleSpecificationChange(
                            index,
                            "label",
                            event.target.value
                          )
                        }
                        placeholder="Example: Material"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                      />

                      <input
                        type="text"
                        value={specification.value}
                        onChange={(event) =>
                          handleSpecificationChange(
                            index,
                            "value",
                            event.target.value
                          )
                        }
                        placeholder="Example: GL, GI"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                      />

                      <button
                        type="button"
                        onClick={() => removeSpecificationRow(index)}
                        className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#111c2e]">
                  Product Description
                </span>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Enter product description"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                />
              </label>

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
                      ? "Update Product"
                      : "Save Product"}
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

export default AdminProducts;
