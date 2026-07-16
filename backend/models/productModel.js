import mongoose from "mongoose";

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
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;