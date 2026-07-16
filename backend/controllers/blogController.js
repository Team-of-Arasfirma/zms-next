import Blog from "../models/blogModel.js";

const normalizeStatus = (status) => {
  const allowedStatuses = ["Published", "Draft"];

  if (allowedStatuses.includes(status)) {
    return status;
  }

  return "Published";
};

const getImageUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

// Convert HTML content into plain text.
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

// Create a short excerpt without cutting words in the middle.
const createExcerpt = (html = "", maxLength = 160) => {
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
    lastSpaceIndex > 0
      ? trimmedText.slice(0, lastSpaceIndex)
      : trimmedText;

  return `${safeText.trim()}...`;
};

// -------------------------------
// Create Blog
// -------------------------------
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      date,
      status,
      content,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !slug || !date || !content) {
      return res.status(400).json({
        message: "Title, slug, date, and content are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Blog cover image is required",
      });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existingBlog = await Blog.findOne({
      slug: normalizedSlug,
    });

    if (existingBlog) {
      return res.status(409).json({
        message: "Blog slug already exists",
      });
    }

    const coverImage = getImageUrl(req.file);

    if (!coverImage) {
      return res.status(500).json({
        message: "Cloudinary image URL not found",
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: normalizedSlug,
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
// Lightweight listing data only
// -------------------------------
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select(
        "title slug date status coverImage metaTitle metaDescription content createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    const listingBlogs = blogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      date: blog.date,
      status: blog.status,
      coverImage: blog.coverImage,
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      excerpt: createExcerpt(blog.content, 160),
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
      slug: req.params.slug.trim().toLowerCase(),
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
      date,
      status,
      content,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !slug || !date || !content) {
      return res.status(400).json({
        message: "Title, slug, date, and content are required",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const normalizedSlug = slug.trim().toLowerCase();

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
    blog.date = date;
    blog.status = normalizeStatus(status);
    blog.content = content;
    blog.metaTitle = metaTitle?.trim() || "";
    blog.metaDescription = metaDescription?.trim() || "";

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