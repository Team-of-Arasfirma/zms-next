import BlogCards from "@/components/Blog/BlogCards";
import BlogHero from "@/components/Blog/BlogHero";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function getBlogsByCategory(categorySlug) {
  try {
    const response = await fetch(
      `${API_BASE}/api/blogs?categorySlug=${encodeURIComponent(categorySlug)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((blog) => blog.status === "Published")
      .map((blog) => ({
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category || "",
        categorySlug: blog.categorySlug || "",
        subCategory: blog.subCategory || "",
        subCategorySlug: blog.subCategorySlug || "",
        date: blog.date,
        status: blog.status,
        coverImage: blog.coverImage || "",
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        excerpt:
          blog.excerpt ||
          blog.metaDescription ||
          "Read more about this article.",
      }));
  } catch (error) {
    console.error("Blog category API connection failed:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${API_BASE}/api/blogs/categories`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Blog categories fetch failed:", error);
    return [];
  }
}

async function getSubCategories(categorySlug) {
  try {
    const response = await fetch(
      `${API_BASE}/api/blogs/sub-categories?categorySlug=${encodeURIComponent(categorySlug)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Blog subcategories fetch failed:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const readableCategory = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${readableCategory} Blogs`,
    description: `Read ${readableCategory} related blogs and updates from ZMSIPL.`,
  };
}

export default async function BlogCategoryPage({ params }) {
  const { categorySlug } = await params;
  const [blogs, categories, subCategories] = await Promise.all([
    getBlogsByCategory(categorySlug),
    getCategories(),
    getSubCategories(categorySlug),
  ]);

  return (
    <>
      <BlogHero />
      <BlogCards
        initialBlogs={blogs}
        initialCategories={categories}
        initialSubCategories={subCategories}
        activeCategorySlug={categorySlug}
        activeSubCategorySlug=""
      />
    </>
  );
}