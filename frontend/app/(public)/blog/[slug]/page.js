import BlogDetails from "@/components/Blog/BlogDetails";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function getBlog(slug) {
  try {
    const response = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Blog fetch error:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog",
      description: "Read the latest updates from ZMSIPL.",
    };
  }

  return {
    title: blog.metaTitle || blog.title || "Blog",
    description:
      blog.metaDescription ||
      "Read the latest updates from ZMSIPL.",
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  return (
    <BlogDetails
      slug={slug}
      initialBlog={blog}
    />
  );
}