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
      required: true,
    },

    // SEO meta title for the blog page.
    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    // SEO meta description for the blog page.
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

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;