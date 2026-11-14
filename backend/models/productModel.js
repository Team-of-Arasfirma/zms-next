import mongoose from "mongoose";
import { isProductSlug } from "../utils/productSlug.js";

const specificationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: legacy products keep their existing enquiry fallback until edited.
    enquiryType: {
      type: String,
      enum: ["solar", "general"],
      default: undefined,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      validate: {
        validator(value) {
          // Leave legacy values unchanged during unrelated updates.
          return value == null || (!this.isNew && !this.isModified("slug")) || isProductSlug(value);
        },
        message: "Invalid or reserved product slug",
      },
    },

    thickness: {
      type: String,
      required: true,
      trim: true,
    },

    materialGrade: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["Active", "Draft"],
      default: "Active",
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    specifications: {
      type: [specificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    autoIndex: false,
    autoCreate: false,
  }
);

// Declaration only: provision this index separately after auditing legacy slugs.
productSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
