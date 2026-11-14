import Product from "../models/productModel.js";
import ProductCategory from "../models/productCategoryModel.js";
import { generateProductSlug, isProductSlug } from "../utils/productSlug.js";
import { withProductCategoryMutation } from "../utils/productCategoryMutation.js";

// Omitted values preserve assignments and slugs. JSON null or multipart "" clears category.
const parseCategoryFields = async (body, creating = false, productId = null) => {
  const fields = {};
  if (Object.prototype.hasOwnProperty.call(body, "enquiryType")) {
    if (body.enquiryType !== "solar" && body.enquiryType !== "general") {
      return { error: "Enquiry type must be solar or general" };
    }
    fields.enquiryType = body.enquiryType;
  }
  if (Object.prototype.hasOwnProperty.call(body, "category")) {
    const category = body.category;
    if (category === null || category === "") {
      fields.category = null;
    } else {
      if (typeof category !== "string" || !/^[a-fA-F0-9]{24}$/.test(category)) {
        return { error: "Invalid category ID" };
      }
      if (!(await ProductCategory.exists({ _id: category }))) {
        return { error: "Category not found" };
      }
      fields.category = category;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "slug")) {
    if (body.slug === null) {
      fields.slug = null;
    } else {
      if (typeof body.slug !== "string") return { error: "Invalid product slug" };
      const slug = body.slug.trim().toLowerCase();
      if (!isProductSlug(slug)) return { error: "Invalid or reserved product slug" };
      fields.slug = slug;
    }
  }
  if (creating && !fields.slug) fields.slug = generateProductSlug(body.name);
  if (fields.slug) {
    const query = { slug: fields.slug };
    if (productId) query._id = { $ne: productId };
    if (await Product.exists(query)) {
      return { error: "Product slug already exists. Provide a different slug.", status: 409 };
    }
  }
  return { fields };
};

const sendProductError = (res, error, message) => {
  if (error.code === 11000) return res.status(409).json({ message: "Product slug already exists. Provide a different slug." });
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message, error: error.message });
};
const getImageUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

const parseProductStatus = (body, creating = false) => {
  if (!Object.prototype.hasOwnProperty.call(body, "status")) {
    return { value: creating ? "Active" : undefined };
  }
  if (body.status !== "Active" && body.status !== "Draft") {
    return { error: "Product status must be Active or Draft" };
  }
  return { value: body.status };
};

const parseSpecifications = (specifications) => {
  if (!specifications) {
    return [];
  }

  if (Array.isArray(specifications)) {
    return specifications;
  }

  try {
    const parsedSpecifications = JSON.parse(specifications);

    if (Array.isArray(parsedSpecifications)) {
      return parsedSpecifications;
    }

    return [];
  } catch {
    return [];
  }
};

// Create product.
export const createProduct = (req, res) => withProductCategoryMutation(async () => {
  try {
    const statusInput = parseProductStatus(req.body || {}, true);
    if (statusInput.error) return res.status(400).json({ message: statusInput.error });
    const {
      name,
      thickness,
      materialGrade,
      order,
      description,
      specifications,
    } = req.body;

    if (!name || !thickness || !materialGrade) {
      return res.status(400).json({
        message: "Product name, thickness, and material grade are required",
      });
    }

    const imageUrl = getImageUrl(req.file);

    if (!imageUrl) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    const cleanedSpecifications = parseSpecifications(specifications).filter(
      (specification) => specification.label && specification.value
    );

    if (cleanedSpecifications.length === 0) {
      return res.status(400).json({
        message: "At least one specification is required",
      });
    }

    const optionalFields = await parseCategoryFields(req.body, true);
    if (optionalFields.error) {
      return res.status(optionalFields.status || 400).json({ message: optionalFields.error });
    }

    const product = await Product.create({
      ...optionalFields.fields,
      name: name.trim(),
      thickness: thickness.trim(),
      materialGrade: materialGrade.trim(),
      order: Number(order) || 1,
      status: statusInput.value,
      image: imageUrl,
      description: description?.trim() || "",
      specifications: cleanedSpecifications,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return sendProductError(res, error, "Failed to create product");
  }
});

// Public list stays a bare array and never includes Draft products.
const listProducts = async (res, filter) => {
  try {
    const products = await Product.find(filter).sort({ order: 1, createdAt: -1 });
    res.set("Cache-Control", "no-store");
    return res.status(200).json(products);
  } catch (error) {
    return sendProductError(res, error, "Failed to fetch products");
  }
};

export const getProducts = async (req, res) => {
  try {
    // One aggregation joins category visibility before returning any records.
    // category:null includes missing fields on intentional legacy products.
    const products = await Product.aggregate([
      { $match: { status: "Active" } },
      {
        $lookup: {
          from: ProductCategory.collection.name,
          let: { assignedCategory: "$category" },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ["$_id", "$$assignedCategory"] },
              { $eq: ["$status", "Active"] },
            ] } } },
            { $project: { _id: 1 } },
          ],
          as: "__publicCategory",
        },
      },
      { $match: { $or: [{ category: null }, { "__publicCategory.0": { $exists: true } }] } },
      { $sort: { order: 1, createdAt: -1 } },
      { $project: { __publicCategory: 0 } },
    ]);
    res.set("Cache-Control", "no-store");
    // Preserve the existing document serialization/defaults and bare-array shape.
    return res.status(200).json(products.map((product) => Product.hydrate(product)));
  } catch (error) {
    return sendProductError(res, error, "Failed to fetch products");
  }
};

// This handler is reachable only after authentication and products.view permission.
export const getAdminProducts = (req, res) => listProducts(res, {});
// Update product.
export const updateProduct = (req, res) => withProductCategoryMutation(async () => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
  try {
    const statusInput = parseProductStatus(req.body || {});
    if (statusInput.error) return res.status(400).json({ message: statusInput.error });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      thickness,
      materialGrade,
      order,
      description,
      specifications,
    } = req.body;

    if (!name || !thickness || !materialGrade) {
      return res.status(400).json({
        message: "Product name, thickness, and material grade are required",
      });
    }

    const cleanedSpecifications = parseSpecifications(specifications).filter(
      (specification) => specification.label && specification.value
    );

    if (cleanedSpecifications.length === 0) {
      return res.status(400).json({
        message: "At least one specification is required",
      });
    }

    const imageUrl = getImageUrl(req.file);

    const optionalFields = await parseCategoryFields(req.body, false, product._id);
    if (optionalFields.error) {
      return res.status(optionalFields.status || 400).json({ message: optionalFields.error });
    }
    Object.assign(product, optionalFields.fields);

    product.name = name.trim();
    product.thickness = thickness.trim();
    product.materialGrade = materialGrade.trim();
    product.order = Number(order) || 1;
    if (statusInput.value !== undefined) product.status = statusInput.value;
    product.description = description?.trim() || "";
    product.specifications = cleanedSpecifications;

    if (imageUrl) {
      product.image = imageUrl;
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return sendProductError(res, error, "Failed to update product");
  }
});

// Delete product.
export const deleteProduct = (req, res) => withProductCategoryMutation(async () => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return sendProductError(res, error, "Failed to delete product");
  }
});
