import BlogCards from "@/components/Blog/BlogCards";
import BlogHero from "@/components/Blog/BlogHero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogs",
  description:
    "Explore the latest blogs, steel structure insights, fabrication updates, and industry news from ZMSIPL.",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function getBlogs() {
  try {
    const response = await fetch(`${API_BASE}/api/blogs`, {
      cache: "no-store",
    });

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
        date: blog.date,
        status: blog.status,
        coverImage: blog.coverImage,
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        excerpt:
          blog.excerpt ||
          blog.metaDescription ||
          "Read more about this article.",
      }));
  } catch (error) {
    console.error("Blog listing fetch error:", error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <>
      <BlogHero />
      <BlogCards initialBlogs={blogs} />
    </>
  );
}