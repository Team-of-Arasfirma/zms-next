import Product from "../models/productModel.js";

const getImageUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

const normalizeStatus = (status) => {
  return status === "Draft" ? "Draft" : "Active";
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
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      thickness,
      materialGrade,
      order,
      status,
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

    const product = await Product.create({
      name: name.trim(),
      thickness: thickness.trim(),
      materialGrade: materialGrade.trim(),
      order: Number(order) || 1,
      status: normalizeStatus(status),
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

    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Get all products.
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Update product.
export const updateProduct = async (req, res) => {
  try {
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
      status,
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

    product.name = name.trim();
    product.thickness = thickness.trim();
    product.materialGrade = materialGrade.trim();
    product.order = Number(order) || 1;
    product.status = normalizeStatus(status);
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

    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product.
export const deleteProduct = async (req, res) => {
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

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};