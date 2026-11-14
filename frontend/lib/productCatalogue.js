const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isCatalogueSlug = (slug) => typeof slug === "string" && slug.length <= 200 && slugPattern.test(slug);
export const categoryId = (product) => product.category?._id || product.category || null;
export const categoryPath = (category) => `/product/category/${encodeURIComponent(category.slug)}`;

export function activeCategories(data) {
  if (!Array.isArray(data)) throw new Error("Invalid category response.");
  return data.filter((category) => category.status === "Active" && isCatalogueSlug(category.slug))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export function publishedProducts(data, categories) {
  if (!Array.isArray(data)) throw new Error("Invalid product response.");
  const activeIds = new Set(categories.map((category) => category._id));
  const active = data.filter((product) => product.status === "Active" && (!categoryId(product) || activeIds.has(categoryId(product))));
  const slugCounts = new Map();
  // Check the public array defensively for legacy duplicate slugs.
  for (const product of data) {
    if (isCatalogueSlug(product.slug)) slugCounts.set(product.slug, (slugCounts.get(product.slug) || 0) + 1);
  }
  return active.map((product) => {
    const category = categories.find((item) => item._id === categoryId(product));
    // Reserve item-{ObjectId} for stable, collision-free legacy detail URLs.
    const useSlug = isCatalogueSlug(product.slug) && slugCounts.get(product.slug) === 1 && !/^item-[a-f0-9]{24}$/.test(product.slug) && product.slug !== "category";
    const detailSlug = useSlug ? product.slug : `item-${product._id}`;
    // Explicit classification is stable across category assignment/name changes.
    // Only records without a valid explicit value retain the historical fallback.
    const explicitEnquiryType = ["solar", "general"].includes(product.enquiryType) ? product.enquiryType : null;
    const solarCategory = category && /solar.*mount|mount.*solar/i.test(`${category.name} ${category.slug}`);
    return {
      ...product,
      detailSlug,
      detailPath: `/product/${encodeURIComponent(detailSlug)}`,
      enquiryType: explicitEnquiryType || (!categoryId(product) || solarCategory ? "solar" : "general"),
      categoryName: category?.name || "",
      categorySlug: category?.slug || "",
    };
  }).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export function catalogueImage(src) {
  if (typeof src !== "string" || !src.trim()) return "";
  const value = src.trim();
  if (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)) return value;
  if (/^[a-z0-9_.-]+\//i.test(value)) return `/${value}`;
  return "";
}