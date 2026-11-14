
import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 200,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    // Default enquiry form for products in this category.
    // Existing category records without this field
    // require a documented legacy fallback.
    defaultEnquiryType: {
      type: String,
      enum: ["solar", "general"],
      default: "general",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
    autoCreate: false,
  }
);

// Unique slug index requires separate database approval.
export default mongoose.model(
  "ProductCategory",
  productCategorySchema
);
