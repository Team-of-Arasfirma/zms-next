import ProductCategory from "../models/productCategoryModel.js";
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";
import { withProductCategoryMutation } from "../utils/productCategoryMutation.js";

const fields = ["name", "slug", "description", "image", "defaultEnquiryType", "status", "order"];
const enquiryTypes = ["solar", "general"];
const validId = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const sendError = (res, error) => {
  if (error?.code === 11000) {
    return res.status(409).json({ message: "Category slug already exists" });
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  // Never expose raw internal failures to public/API clients.
  console.error("Category operation failed:", error);
  return res.status(500).json({ message: "Category operation failed" });
};

// req.file.filename is the Cloudinary public_id from multer-storage-cloudinary.
// Only clean up the brand-new upload; never delete a category's existing image.
const removeFailedUpload = async (file) => {
  if (!file?.filename) return;
  try {
    await cloudinary.uploader.destroy(file.filename, { resource_type: "image" });
  } catch (error) {
    console.error("Could not clean up failed category upload:", error);
  }
};

const parseInput = (body, creating = false, multipart = false, hasUpload = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid category input");
  }
  if (Object.keys(body).some((key) => !fields.includes(key))) {
    throw new Error("Unknown category field");
  }
  // Reject an ambiguous image URL and file upload in the same request.
  if (hasUpload && Object.prototype.hasOwnProperty.call(body, "image")) {
    throw new Error("Provide either an image upload or an image URL, not both");
  }

  const data = {};
  for (const key of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const value = body[key];
    if (key === "order") {
      const parsed = multipart && typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : value;
      if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed < 0) {
        throw new Error("Order must be a nonnegative safe integer");
      }
      data[key] = parsed;
      continue;
    }
    if (typeof value !== "string") throw new Error(`${key} must be a string`);
    if (key === "defaultEnquiryType" && !enquiryTypes.includes(value)) {
      throw new Error("Enquiry type must be solar or general");
    }
    if (key === "image" && !creating && !value.trim()) continue;
    if (key === "image" && value.trim() && !/^https:\/\/[^\s]+$/i.test(value.trim())) {
      throw new Error("Image must be a valid HTTPS URL");
    }
    data[key] = key === "slug" ? value.trim().toLowerCase() : value.trim();
  }

  if (creating && (!data.name || !data.slug)) {
    throw new Error("Name and slug are required");
  }
  if (!creating && !Object.keys(data).length && !hasUpload) {
    throw new Error("No category fields provided");
  }
  return data;
};

const inputOrError = (req, res, creating) => {
  try {
    const multipart = Boolean(req.is("multipart/form-data"));
    return parseInput(req.body, creating, multipart, Boolean(req.file));
  } catch (error) {
    res.status(400).json({ message: error.message });
    return null;
  }
};

export const getPublishedCategories = async (req, res) => {
  try {
    return res.status(200).json(
      await ProductCategory.find({ status: "Active" }).sort({ order: 1, createdAt: -1 })
    );
  } catch (error) { return sendError(res, error); }
};

export const getCategoryBySlug = async (req, res) => {
  const slug = req.params.slug;
  if (typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ message: "Invalid category slug" });
  }
  try {
    const category = await ProductCategory.findOne({ slug, status: "Active" });
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json(category);
  } catch (error) { return sendError(res, error); }
};

export const getAllCategories = async (req, res) => {
  try {
    return res.status(200).json(await ProductCategory.find().sort({ order: 1, createdAt: -1 }));
  } catch (error) { return sendError(res, error); }
};

export const createCategory = (req, res) => withProductCategoryMutation(async () => {
  const data = inputOrError(req, res, true);
  if (!data) {
    await removeFailedUpload(req.file);
    return;
  }
  try {
    if (req.file) data.image = req.file.path;
    const category = new ProductCategory(data);
    await category.validate();
    if (await ProductCategory.exists({ slug: category.slug })) {
      await removeFailedUpload(req.file);
      return res.status(409).json({ message: "Category slug already exists" });
    }
    await category.save();
    return res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    await removeFailedUpload(req.file);
    return sendError(res, error);
  }
});

export const updateCategory = (req, res) => withProductCategoryMutation(async () => {
  if (!validId(req.params.id)) {
    await removeFailedUpload(req.file);
    return res.status(400).json({ message: "Invalid category ID" });
  }
  const data = inputOrError(req, res, false);
  if (!data) {
    await removeFailedUpload(req.file);
    return;
  }
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      await removeFailedUpload(req.file);
      return res.status(404).json({ message: "Category not found" });
    }
    if (req.file) data.image = req.file.path;
    Object.assign(category, data);
    await category.validate();
    if (await ProductCategory.exists({ slug: category.slug, _id: { $ne: category._id } })) {
      await removeFailedUpload(req.file);
      return res.status(409).json({ message: "Category slug already exists" });
    }
    await category.save();
    // Existing image is intentionally retained in Cloudinary; cleanup requires
    // separately approved asset lifecycle controls.
    return res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    await removeFailedUpload(req.file);
    return sendError(res, error);
  }
});

export const deleteCategory = (req, res) => withProductCategoryMutation(async () => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid category ID" });
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (await Product.exists({ category: category._id })) {
      return res.status(409).json({ message: "Category is referenced by a product" });
    }
    await category.deleteOne();
    // Do not delete Cloudinary assets automatically.
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) { return sendError(res, error); }
});
