import PageSeo from "../models/pageSeoModel.js";
import { ROOT_TITLE, ROOT_DESCRIPTION, blogPath, revisionOf, text, diagnose } from "./seoDiagnostics.js";
import Product from "../models/productModel.js";
import Category from "../models/productCategoryModel.js";
import Blog from "../models/blogModel.js";
export const staticSeoPages = [["Home", "/"], ["About", "/about"], ["Products", "/product"], ["Projects", "/project"], ["Blog", "/blog"], ["Career", "/career"], ["Contact", "/contact"]];
export function validSeoPath(path) {
  return typeof path === "string" && path.length <= 1000 && (path === "/" || /^\/[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9-]+)*$/.test(path));
}
const readable = slug => slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
const slugValid = s => typeof s === "string" && s.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
export async function getSeoPages() {
  const [products, categories, blogs] = await Promise.all([
    Product.find().select("name slug status category description updatedAt").lean(),
    Category.find({ status: "Active" }).select("name slug description updatedAt").lean(),
    Blog.find({ status: "Published" }).select("title slug category categorySlug subCategory subCategorySlug metaTitle metaDescription updatedAt seoUpdatedAt").lean(),
  ]);
  const pages = new Map();
  const add = (label, path, group, extra = {}) => {
    if (validSeoPath(path) && !pages.has(path)) pages.set(path, { label, pageKey: path, pagePath: path, group, tab: "Pages", defaultTitle: ROOT_TITLE, defaultDescription: ROOT_DESCRIPTION, ...extra });
  };
  staticSeoPages.forEach(([label, path]) => add(label, path, "Main pages"));
  const ids = new Set(categories.filter(c => slugValid(c.slug)).map(c => String(c._id)));
  categories.filter(c => slugValid(c.slug)).forEach(c => add(c.name, `/product/category/${c.slug}`, "Product categories", { tab: "Product Categories", contentId: String(c._id), defaultTitle: `${c.name} | ZMSIPL`, defaultDescription: text(c.description) || `Explore ${c.name} products from ZMSIPL.` }));
  const counts = new Map();
  products.forEach(p => { if (slugValid(p.slug)) counts.set(p.slug, (counts.get(p.slug) || 0) + 1); });
  products.filter(p => p.status === "Active" && (!p.category || ids.has(String(p.category)))).forEach(p => {
    const slug = slugValid(p.slug) && counts.get(p.slug) === 1 && p.slug !== "category" && !/^item-[a-f0-9]{24}$/.test(p.slug) ? p.slug : `item-${p._id}`;
    add(p.name, `/product/${slug}`, "Products", { tab: "Products", contentId: String(p._id), defaultTitle: `${p.name} | ZMSIPL`, defaultDescription: text(p.description) || `Discover ${p.name}, technical specifications and enquiries at ZMSIPL.` });
  });
  blogs.forEach(b => {
    if (!slugValid(b.slug)) return;
    const path = blogPath(b);
    add(b.title, path, "Blog Posts", { tab: "Blog Posts", source: "blog", readOnly: true, contentId: String(b._id),
      defaultTitle: `${b.title || "Blog"} | ZMSIPL`, defaultDescription: "Read the latest updates from ZMSIPL.",
      seoTitle: b.metaTitle || "", metaDescription: b.metaDescription || "", revision: revisionOf(b), updatedAt: b.updatedAt || null, seoUpdatedAt: b.seoUpdatedAt || null,
      blogAdminUrl: `/admin/blogs?edit=${encodeURIComponent(String(b._id))}`,
      aliases: [`/blog/${b.slug}`] });
    if (b.categorySlug) add(text(b.category) || readable(b.categorySlug), `/blog/category/${b.categorySlug}`, "Blog Categories", { tab: "Blog Categories", defaultTitle: `${readable(b.categorySlug)} Blogs | ZMSIPL`, defaultDescription: `Read ${readable(b.categorySlug)} related blogs and updates from ZMSIPL.` });
    if (b.categorySlug && b.subCategorySlug) add(`${text(b.category) || readable(b.categorySlug)} / ${text(b.subCategory) || readable(b.subCategorySlug)}`, `/blog/category/${b.categorySlug}/${b.subCategorySlug}`, "Blog Subcategories", { tab: "Blog Subcategories", parentCategory: text(b.category) || readable(b.categorySlug), subcategoryName: text(b.subCategory) || readable(b.subCategorySlug), defaultTitle: `${readable(b.subCategorySlug)} Blogs | ZMSIPL`, defaultDescription: `Read ${readable(b.subCategorySlug)} related blogs and updates from ZMSIPL.` });
  });
  const overrides = await PageSeo.find().select("pagePath seoTitle metaDescription disabled updatedAt").lean();
  const byPath = new Map(overrides.map(r => [r._id, r]));
  for (const item of pages.values()) {
    if (item.pagePath === "/blog") { item.defaultTitle = "Blogs | ZMSIPL"; item.defaultDescription = "Explore the latest blogs, steel structure insights, fabrication updates, and industry news from ZMSIPL."; }
    if (item.pagePath === "/product") { item.defaultTitle = "Steel Products & Solar Mounting Structures | ZMSIPL"; item.defaultDescription = "Explore ZMSIPL solar mounting structures, metal purlins and customised structural solutions. Browse product categories and technical specifications."; }
    if (item.source === "blog") {
      item.legacyOverrides = [...new Set([item.pagePath, ...item.aliases])].map(path => byPath.get(path)).filter(Boolean).map(r => ({ pagePath: r._id, seoTitle: r.seoTitle || "", metaDescription: r.metaDescription || "", disabled: Boolean(r.disabled), revision: revisionOf(r) }));
      item.configured = Boolean(text(item.seoTitle) || text(item.metaDescription));
      item.effectiveTitle = text(item.seoTitle) ? `${text(item.seoTitle)} | ZMSIPL` : item.defaultTitle;
      item.effectiveDescription = text(item.metaDescription) || item.defaultDescription;
    } else {
      const record = byPath.get(item.pagePath);
      item.source = "page"; item.revision = revisionOf(record); item.hasOverride = Boolean(record && !record.disabled && (text(record.seoTitle) || text(record.metaDescription)));
      item.seoTitle = record?.disabled ? "" : record?.seoTitle || "";
      item.metaDescription = record?.disabled ? "" : record?.metaDescription || "";
      item.updatedAt = record?.updatedAt || null; item.seoUpdatedAt = record?.updatedAt || null; item.configured = item.hasOverride;
      item.effectiveTitle = text(item.seoTitle) || item.defaultTitle;
      item.effectiveDescription = text(item.metaDescription) || item.defaultDescription;
    }
  }
  return diagnose([...pages.values()]);
}
