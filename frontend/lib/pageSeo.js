const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
// Current values on every server request; bounded failures preserve existing metadata.
export async function withPageSeo(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}/api/seo?path=${encodeURIComponent(path)}`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!response.ok) return fallback;
    const data = await response.json();
    const title = typeof data.seoTitle === "string" ? data.seoTitle.trim() : "";
    const description = typeof data.metaDescription === "string" ? data.metaDescription.trim() : "";
    if (!title && !description) return fallback;
    const fields = { ...(title ? { title } : {}), ...(description ? { description } : {}) };
    return { ...fallback, ...(title ? { title: { absolute: title } } : {}), ...(description ? { description } : {}),
      openGraph: { ...fallback.openGraph, ...fields }, twitter: { ...fallback.twitter, ...fields } };
  } catch { return fallback; }
}

// Individual Blog Posts use only their existing Blog fields and fallbacks.
// Legacy PageSeo values remain available in Admin for explicit archival.
export async function withBlogSeo(_path, fallback) {
  const title = typeof fallback.title === "string" ? `${fallback.title} | ZMSIPL` : fallback.title?.absolute;
  return {
    ...fallback,
    openGraph: { ...fallback.openGraph, title, description: fallback.description },
    twitter: { ...fallback.twitter, title, description: fallback.description },
  };
}
