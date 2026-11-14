import { categoryId, categoryPath, isCatalogueSlug } from "./productCatalogue";
import { PRODUCT_SITE_URL } from "./productSeo";

const validId = (value) => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);
const validName = (value) => typeof value === "string" && Boolean(value.trim());

export function escapeProductSitemapXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function lastModified(record) {
  // Mongoose timestamps are UTC ISO strings. Do not substitute today's date.
  for (const value of [record.updatedAt, record.createdAt]) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()) && date.getTime() <= Date.now() && date.toISOString().slice(0, 19) === value.slice(0, 19)) {
      return date.toISOString();
    }
  }
  return null;
}

export function createProductSitemap({ categories, products }) {
  if (!Array.isArray(categories) || !Array.isArray(products)) {
    throw new Error("Invalid catalogue response.");
  }
  const candidates = categories.filter((category) => category?.status === "Active" && validId(category._id) && validName(category.name) && isCatalogueSlug(category.slug));
  const categorySlugIds = new Map();
  for (const category of candidates) {
    const ids = categorySlugIds.get(category.slug) || new Set();
    ids.add(category._id);
    categorySlugIds.set(category.slug, ids);
  }
  // Ambiguous legacy category slugs cannot identify a reliable public page.
  const publicCategories = candidates.filter((category) => categorySlugIds.get(category.slug).size === 1);
  const activeCategoryIds = new Set(publicCategories.map((category) => category._id));
  const urls = new Map();
  const add = (path, record) => {
    const url = `${PRODUCT_SITE_URL}${path}`;
    if (!urls.has(url)) urls.set(url, { url, lastmod: lastModified(record) });
  };
  for (const category of publicCategories) add(categoryPath(category), category);
  for (const product of products) {
    if (product?.status !== "Active" || !validId(product._id) || !validName(product.name) || !activeCategoryIds.has(categoryId(product)) || !isCatalogueSlug(product.detailSlug)) continue;
    const canonicalPath = `/product/${encodeURIComponent(product.detailSlug)}`;
    if (product.detailPath !== canonicalPath || product.detailSlug === "category") continue;
    // detailPath is the preferred URL chosen by the public catalogue. Never add
    // a second item-{id} alias when that product has a preferred slug.
    if (/^item-[a-f0-9]{24}$/.test(product.detailSlug) && product.detailSlug !== `item-${product._id}`) continue;
    add(canonicalPath, product);
  }
  if (urls.size > 50000) throw new Error("Product sitemap requires splitting.");
  const entries = [...urls.values()].map(({ url, lastmod }) =>
    `<url><loc>${escapeProductSitemapXml(url)}</loc>${lastmod ? `<lastmod>${escapeProductSitemapXml(lastmod)}</lastmod>` : ""}</url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}