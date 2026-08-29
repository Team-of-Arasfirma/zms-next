import Blog from "../models/blogModel.js";

const normalizeStatus = (status) => {
  const allowedStatuses = ["Published", "Draft"];
  return allowedStatuses.includes(status) ? status : "Published";
};

const getImageUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

const createSlug = (value = "") => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const stripHtml = (html = "") => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const createExcerpt = (html = "", maxLength = 260) => {
  const plainText = stripHtml(html);

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const trimmedText = plainText.slice(0, maxLength);
  const lastSpaceIndex = trimmedText.lastIndexOf(" ");
  const safeText =
    lastSpaceIndex > 0 ? trimmedText.slice(0, lastSpaceIndex) : trimmedText;

  return `${safeText.trim()}...`;
};

const requiredBlogFieldsMissing = ({
  title,
  slug,
  category,
  categorySlug,
  date,
  content,
}) => !title || !slug || !category || !categorySlug || !date || !content;

// -------------------------------
// Create Blog
// -------------------------------
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      categorySlug,
      subCategory,
      subCategorySlug,
      date,
      status,
      content,
      metaTitle,
      metaDescription,
    } = req.body;

    if (
      requiredBlogFieldsMissing({
        title,
        slug,
        category,
        categorySlug,
        date,
        content,
      })
    ) {
      return res.status(400).json({
        message:
          "Title, slug, category, category slug, date, and content are required",
      });
    }

    const normalizedSlug = createSlug(slug);
    const normalizedCategorySlug = createSlug(categorySlug || category);
    const normalizedSubCategorySlug = subCategorySlug
      ? createSlug(subCategorySlug)
      : createSlug(subCategory || "");

    if (!normalizedSlug || !normalizedCategorySlug) {
      return res.status(400).json({
        message: "Valid blog slug and category slug are required",
      });
    }

    const existingBlog = await Blog.findOne({
      slug: normalizedSlug,
    });

    if (existingBlog) {
      return res.status(409).json({
        message: "Blog slug already exists",
      });
    }

    const coverImage = req.file ? getImageUrl(req.file) : "";

    if (req.file && !coverImage) {
      return res.status(500).json({
        message: "Cloudinary image URL not found",
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: normalizedSlug,
      category: category.trim(),
      categorySlug: normalizedCategorySlug,
      subCategory: subCategory?.trim() || "",
      subCategorySlug: normalizedSubCategorySlug,
      date,
      status: normalizeStatus(status),
      content,
      coverImage,
      metaTitle: metaTitle?.trim() || "",
      metaDescription: metaDescription?.trim() || "",
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);

    return res.status(500).json({
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Blogs
// -------------------------------
export const getBlogs = async (req, res) => {
  try {
    const { categorySlug, subCategorySlug, status } = req.query;

    const filter = {};

    if (categorySlug) {
      filter.categorySlug = createSlug(categorySlug);
    }

    if (subCategorySlug) {
      filter.subCategorySlug = createSlug(subCategorySlug);
    }

    if (status) {
      filter.status = normalizeStatus(status);
    }

    const blogs = await Blog.find(filter)
      .select(
        "title slug category categorySlug subCategory subCategorySlug date status coverImage metaTitle metaDescription content createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    const listingBlogs = blogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      categorySlug: blog.categorySlug,
      subCategory: blog.subCategory || "",
      subCategorySlug: blog.subCategorySlug || "",
      date: blog.date,
      status: blog.status,
      coverImage: blog.coverImage || "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      excerpt: createExcerpt(blog.content, 260),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    }));

    return res.status(200).json(listingBlogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);

    return res.status(500).json({
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Blog Categories
// -------------------------------
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      {
        $match: {
          status: "Published",
        },
      },
      {
        $group: {
          _id: "$categorySlug",
          category: {
            $first: "$category",
          },
          categorySlug: {
            $first: "$categorySlug",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          categorySlug: 1,
          count: 1,
        },
      },
    ]);

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get Blog Categories Error:", error);

    return res.status(500).json({
      message: "Failed to fetch blog categories",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Blog Sub Categories
// -------------------------------
export const getBlogSubCategories = async (req, res) => {
  try {
    const { categorySlug } = req.query;

    const match = {
      status: "Published",
      subCategorySlug: {
        $nin: [null, ""],
      },
    };

    if (categorySlug) {
      match.categorySlug = createSlug(categorySlug);
    }

    const subCategories = await Blog.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: {
            categorySlug: "$categorySlug",
            subCategorySlug: "$subCategorySlug",
          },
          subCategory: {
            $first: "$subCategory",
          },
          subCategorySlug: {
            $first: "$subCategorySlug",
          },
          category: {
            $first: "$category",
          },
          categorySlug: {
            $first: "$categorySlug",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          category: 1,
          subCategory: 1,
        },
      },
      {
        $project: {
          _id: 0,
          subCategory: 1,
          subCategorySlug: 1,
          category: 1,
          categorySlug: 1,
          count: 1,
        },
      },
    ]);

    return res.status(200).json(subCategories);
  } catch (error) {
    console.error("Get Blog Subcategories Error:", error);

    return res.status(500).json({
      message: "Failed to fetch blog subcategories",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Single Blog By ID
// Full blog data for admin edit
// -------------------------------
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json(blog);
  } catch (error) {
    console.error("Get Blog By ID Error:", error);

    return res.status(500).json({
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Single Blog By Slug
// Full blog data for public detail page
// -------------------------------
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: createSlug(req.params.slug),
      status: "Published",
    });

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json(blog);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);

    return res.status(500).json({
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// -------------------------------
// Update Blog
// -------------------------------
export const updateBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      categorySlug,
      subCategory,
      subCategorySlug,
      date,
      status,
      content,
      metaTitle,
      metaDescription,
      removeCoverImage,
    } = req.body;

    if (
      requiredBlogFieldsMissing({
        title,
        slug,
        category,
        categorySlug,
        date,
        content,
      })
    ) {
      return res.status(400).json({
        message:
          "Title, slug, category, category slug, date, and content are required",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const normalizedSlug = createSlug(slug);
    const normalizedCategorySlug = createSlug(categorySlug || category);
    const normalizedSubCategorySlug = subCategorySlug
      ? createSlug(subCategorySlug)
      : createSlug(subCategory || "");

    if (!normalizedSlug || !normalizedCategorySlug) {
      return res.status(400).json({
        message: "Valid blog slug and category slug are required",
      });
    }

    const duplicateSlug = await Blog.findOne({
      slug: normalizedSlug,
      _id: {
        $ne: req.params.id,
      },
    });

    if (duplicateSlug) {
      return res.status(409).json({
        message: "Blog slug already exists",
      });
    }

    blog.title = title.trim();
    blog.slug = normalizedSlug;
    blog.category = category.trim();
    blog.categorySlug = normalizedCategorySlug;
    blog.subCategory = subCategory?.trim() || "";
    blog.subCategorySlug = normalizedSubCategorySlug;
    blog.date = date;
    blog.status = normalizeStatus(status);
    blog.content = content;
    blog.metaTitle = metaTitle?.trim() || "";
    blog.metaDescription = metaDescription?.trim() || "";

    if (removeCoverImage === "true") {
      blog.coverImage = "";
    }

    if (req.file) {
      const coverImage = getImageUrl(req.file);

      if (!coverImage) {
        return res.status(500).json({
          message: "Cloudinary image URL not found",
        });
      }

      blog.coverImage = coverImage;
    }

    const updatedBlog = await blog.save();

    return res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);

    return res.status(500).json({
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// -------------------------------
// Delete Blog
// -------------------------------
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);

    return res.status(500).json({
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};