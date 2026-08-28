import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    categorySlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subCategory: {
      type: String,
      trim: true,
      default: "",
    },

    subCategorySlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },

    content: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ categorySlug: 1 });
blogSchema.index({ subCategorySlug: 1 });
blogSchema.index({ status: 1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;