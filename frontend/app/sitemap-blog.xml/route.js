const SITE_URL = "https://www.zmsipl.com";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

async function getPublishedBlogs() {
  try {
    const response = await fetch(`${API_BASE}/api/blogs?status=Published`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Blog sitemap fetch error:", error);
    return [];
  }
}

const formatDate = (dateValue) => {
  if (!dateValue) {
    return new Date().toISOString().split("T")[0];
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return date.toISOString().split("T")[0];
};

const escapeXml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const getBlogUrl = (blog) => {
  if (blog.categorySlug && blog.subCategorySlug) {
    return `${SITE_URL}/${blog.categorySlug}/${blog.subCategorySlug}/${blog.slug}`;
  }

  if (blog.categorySlug) {
    return `${SITE_URL}/${blog.categorySlug}/${blog.slug}`;
  }

  return `${SITE_URL}/blog/${blog.slug}`;
};

export async function GET() {
  const blogs = await getPublishedBlogs();

  const urls = blogs
    .filter((blog) => blog.slug)
    .map((blog) => {
      const blogUrl = getBlogUrl(blog);
      const lastModified = formatDate(
        blog.updatedAt || blog.createdAt || blog.date
      );

      return `
<url>
<loc>${escapeXml(blogUrl)}</loc>
<lastmod>${lastModified}</lastmod>
<priority>0.6</priority>
</url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}