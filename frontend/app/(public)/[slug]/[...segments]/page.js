import BlogDetails from "@/components/Blog/BlogDetails";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function getBlog(blogSlug) {
  try {
    const response = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(blogSlug)}`,
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

const getRouteData = (params) => {
  const categorySlug = params.slug;
  const segments = Array.isArray(params.segments) ? params.segments : [];

  if (segments.length === 1) {
    return {
      categorySlug,
      subCategorySlug: "",
      blogSlug: segments[0],
    };
  }

  return {
    categorySlug,
    subCategorySlug: segments[0] || "",
    blogSlug: segments[1] || "",
  };
};

const getCanonicalPath = (routeData, blog = null) => {
  const categorySlug = blog?.categorySlug || routeData.categorySlug;
  const subCategorySlug = blog?.subCategorySlug || routeData.subCategorySlug;
  const blogSlug = blog?.slug || routeData.blogSlug;

  if (categorySlug && subCategorySlug && blogSlug) {
    return `/${categorySlug}/${subCategorySlug}/${blogSlug}`;
  }

  if (categorySlug && blogSlug) {
    return `/${categorySlug}/${blogSlug}`;
  }

  return `/blog/${blogSlug}`;
};

export async function generateMetadata({ params }) {
  const routeData = getRouteData(await params);

  const blog = await getBlog(routeData.blogSlug);

  const canonicalPath = getCanonicalPath(routeData, blog);

  if (!blog) {
    return {
      title: "Blog",
      description: "Read the latest updates from ZMSIPL.",
      alternates: {
        canonical: canonicalPath,
      },
    };
  }

  return {
    title: blog.metaTitle || blog.title || "Blog",
    description:
      blog.metaDescription || "Read the latest updates from ZMSIPL.",
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function CleanBlogDetailPage({ params }) {
  const routeData = getRouteData(await params);

  const blog = await getBlog(routeData.blogSlug);

  return (
    <BlogDetails
      slug={routeData.blogSlug}
      categorySlug={routeData.categorySlug}
      subCategorySlug={routeData.subCategorySlug}
      initialBlog={blog}
    />
  );
}