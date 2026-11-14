export const ROOT_TITLE = "ZMSIPL | Zaron Metal Sections";
export const ROOT_DESCRIPTION = "ZMSIPL provides high-quality solar mounting structures and metal section solutions.";
export const text = value => typeof value === "string" ? value.trim() : "";
export const revisionOf = record => record ? JSON.stringify([text(record.metaTitle ?? record.seoTitle), text(record.metaDescription), record.updatedAt ? new Date(record.updatedAt).toISOString() : null, Boolean(record.disabled)]) : "none";
export const blogPath = blog => blog.categorySlug && blog.subCategorySlug ? `/${blog.categorySlug}/${blog.subCategorySlug}/${blog.slug}` : blog.categorySlug ? `/${blog.categorySlug}/${blog.slug}` : `/blog/${blog.slug}`;
export function diagnose(items) {
  const titles = new Map();
  items.forEach(item => { const key = text(item.effectiveTitle).toLowerCase(); if (key) titles.set(key, (titles.get(key) || 0) + 1); });
  return items.map(item => {
    const issues = [];
    if (!item.noindex && !text(item.effectiveTitle)) issues.push("Missing SEO title");
    if (!item.noindex && !text(item.effectiveDescription)) issues.push("Missing meta description");
    if (text(item.effectiveTitle).length > 70) issues.push("Title exceeds 70 characters and may be truncated");
    if (text(item.effectiveDescription).length > 180) issues.push("Description exceeds 180 characters and may be truncated");
    if (titles.get(text(item.effectiveTitle).toLowerCase()) > 1) issues.push("Duplicate effective title within this library");
    if (item.legacyOverrides?.some(r => !r.disabled && (text(r.seoTitle) || text(r.metaDescription)))) issues.push("Retained legacy Blog override is not applied; review or archive it");
    const missing = !item.noindex && (!text(item.effectiveTitle) || !text(item.effectiveDescription));
    return { ...item, issues, status: missing ? "Missing Metadata" : issues.length ? "Needs Review" : item.configured ? "Configured" : "Using Default" };
  });
}
