export const SEO_TABS = ["Pages", "Products", "Product Categories", "Blog Posts", "Blog Categories", "Blog Subcategories"];
export const isConfigured = item => item.status === "Configured";
export const needsAttention = item => !item.noindex && ["Needs Review", "Missing Metadata"].includes(item.status);
export function hasSeoTimestamp(item) {
  return typeof item.seoUpdatedAt === "string" || item.seoUpdatedAt instanceof Date
    ? Number.isFinite(new Date(item.seoUpdatedAt).getTime()) : false;
}
export function recentlyUpdated(item, now = Date.now()) {
  if (!hasSeoTimestamp(item)) return false;
  const age = now - new Date(item.seoUpdatedAt).getTime();
  return age >= 0 && age <= 7 * 86400000;
}
export const toggleQuickFilter = (current, requested) => !requested || current === requested ? null : requested;
export function filterSeoItems(items, tab, search, filter, quickFilter = null, now = Date.now()) {
  const query = search.trim().toLowerCase();
  return items.filter(item => item.tab === tab && (!query || `${item.label} ${item.pagePath}`.toLowerCase().includes(query)) &&
    (filter === "All" || (filter === "Configured" ? isConfigured(item) : filter === "Missing" ? !item.noindex && item.status === "Missing Metadata" : item.status === "Needs Review")) &&
    (!quickFilter || (quickFilter === "configured" ? isConfigured(item) : quickFilter === "attention" ? needsAttention(item) : recentlyUpdated(item, now))));
}
export function seoMetrics(items, now = Date.now()) {
  return { total: items.length, configured: items.filter(isConfigured).length,
    attention: items.filter(needsAttention).length, recent: items.filter(item => recentlyUpdated(item, now)).length,
    recentUnavailable: items.filter(item => !hasSeoTimestamp(item)).length };
}
export function previewMetadata(item, form) {
  const title = form.seoTitle.trim();
  return { title: title ? item.source === "blog" ? `${title} | ZMSIPL` : title : item.defaultTitle,
    description: form.metaDescription.trim() || item.defaultDescription };
}
