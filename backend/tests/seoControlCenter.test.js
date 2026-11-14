import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { diagnose, revisionOf } from "../utils/seoDiagnostics.js";
import { createBlog, updateBlog } from "../controllers/blogController.js";
import Blog from "../models/blogModel.js";

test("diagnostics distinguish defaults, missing, duplicate, long and custom metadata", () => {
  const items = diagnose([
    { effectiveTitle: "Valid default", effectiveDescription: "Description" },
    { effectiveTitle: "Custom", effectiveDescription: "Description", configured: true },
    { effectiveTitle: "", effectiveDescription: "" },
    { effectiveTitle: "Duplicate", effectiveDescription: "Description" },
    { effectiveTitle: "Duplicate", effectiveDescription: "Description" },
    { effectiveTitle: "x".repeat(71), effectiveDescription: "x".repeat(181) },
  ]);
  assert.deepEqual(items.map(item => item.status), ["Using Default", "Configured", "Missing Metadata", "Needs Review", "Needs Review", "Needs Review"]);
  assert.equal(items[5].issues.length, 2);
});
test("six groups and summary cards combine search, tab, status and reliable SEO dates", async () => {
  const source = await readFile(new URL("../../frontend/lib/seoControlCenter.js", import.meta.url), "utf8");
  const { SEO_TABS, filterSeoItems, seoMetrics, previewMetadata, toggleQuickFilter, recentlyUpdated } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  const now = Date.UTC(2026, 10, 14);
  const items = [
    { tab: "Pages", label: "About", pagePath: "/about", status: "Using Default", defaultTitle: "Default", defaultDescription: "Default description" },
    { tab: "Blog Posts", label: "Configured Article", pagePath: "/news/article", status: "Configured", configured: true, seoUpdatedAt: new Date(now - 1000) },
    { tab: "Blog Posts", label: "Review Article", pagePath: "/news/review", status: "Needs Review", configured: true, updatedAt: new Date(now - 1000) },
    { tab: "Blog Posts", label: "Missing Article", pagePath: "/missing", status: "Missing Metadata" },
    { tab: "Pages", label: "Application", pagePath: "/career/apply/id", status: "Missing Metadata", noindex: true },
    { tab: "Blog Categories", label: "News", pagePath: "/blog/category/news", status: "Configured", configured: true, seoUpdatedAt: new Date(now - 7 * 86400000) },
  ];
  assert.equal(SEO_TABS.length, 6);
  assert.ok(SEO_TABS.includes("Blog Subcategories"));
  assert.equal(filterSeoItems(items, "Blog Posts", "NEWS/", "All").length, 2);
  assert.equal(filterSeoItems(items, "Pages", "about", "Missing").length, 0);
  assert.equal(filterSeoItems(items, "Blog Posts", "", "Configured").length, 1);
  assert.equal(filterSeoItems(items, "Blog Posts", "", "All", "configured", now).length, 1);
  assert.equal(filterSeoItems(items, "Blog Posts", "", "All", "attention", now).length, 2);
  assert.equal(filterSeoItems(items, "Blog Posts", "", "All", "recent", now).length, 1);
  assert.equal(filterSeoItems(items, "Blog Posts", "review", "All", "configured", now).length, 0);
  assert.equal(filterSeoItems(items, "Blog Posts", "NEWS/", "Needs Review", "attention", now).length, 1);
  assert.equal(filterSeoItems(items, "Pages", "", "All", "attention", now).length, 0, "Valid defaults and intentional noindex are not missing-SEO attention results");
  assert.deepEqual(seoMetrics(items, now), { total: 6, configured: 2, attention: 2, recent: 2, recentUnavailable: 4 });
  assert.equal(recentlyUpdated({ updatedAt: new Date(now), createdAt: new Date(now) }, now), false);
  assert.equal(recentlyUpdated({ seoUpdatedAt: "invalid" }, now), false);
  assert.equal(recentlyUpdated({ seoUpdatedAt: new Date(now + 1) }, now), false);
  assert.equal(recentlyUpdated({ seoUpdatedAt: new Date(now - 7 * 86400000 - 1) }, now), false);
  assert.equal(toggleQuickFilter(null, "configured"), "configured");
  assert.equal(toggleQuickFilter("configured", "configured"), null);
  assert.equal(toggleQuickFilter("configured", "attention"), "attention");
  assert.equal(toggleQuickFilter("attention", null), null);
  assert.equal(filterSeoItems(items, "Blog Posts", "NEWS/", "All", toggleQuickFilter("attention", null), now).length, 2, "Total clears only the quick filter and keeps the search/tab");
  assert.equal(previewMetadata(items[0], { seoTitle: "", metaDescription: "" }).title, "Default");
  assert.equal(previewMetadata({ source: "blog" }, { seoTitle: "test2", metaDescription: "sdfgsdg" }).title, "test2 | ZMSIPL");
});
test("existing Blog Admin rejects stale SEO and preserves CRUD fields on current save", async () => {
  const originalFind = Blog.findById; const originalOne = Blog.findOne;
  const blog = { _id: "507f1f77bcf86cd799439016", metaTitle: "Current SEO", metaDescription: "Current description", updatedAt: new Date(), save: async function () { return this; } };
  Blog.findById = async () => blog; Blog.findOne = async () => null;
  const body = { title: "Article", slug: "article", category: "News", categorySlug: "news", date: "2026-11-14", content: "Preserved article content", metaTitle: "Updated from Blog Admin", metaDescription: "Updated description", seoRevision: "stale" };
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } });
  try {
    let res = response(); await updateBlog({ params: { id: blog._id }, body }, res); assert.equal(res.code, 409); assert.equal(blog.metaTitle, "Current SEO");
    body.seoRevision = revisionOf(blog); res = response(); await updateBlog({ params: { id: blog._id }, body }, res);
    assert.equal(res.code, 200); assert.equal(blog.metaTitle, body.metaTitle); assert.equal(blog.content, body.content);
    assert.ok(blog.seoUpdatedAt instanceof Date);
    const seoTime = blog.seoUpdatedAt;
    body.seoRevision = revisionOf(blog); body.content = "Only content changes now"; res = response();
    await updateBlog({ params: { id: blog._id }, body }, res);
    assert.equal(res.code, 200); assert.equal(blog.seoUpdatedAt, seoTime, "Content-only edits preserve the SEO timestamp");
    assert.equal(Blog.schema.options.optimisticConcurrency, true);
  } finally { Blog.findById = originalFind; Blog.findOne = originalOne; }
});

test("only actual initial Blog SEO configuration records an initial SEO timestamp", async () => {
  const originalOne = Blog.findOne; const originalCreate = Blog.create;
  Blog.findOne = async () => null; Blog.create = async values => values;
  const body = { title: "Article", slug: "article", category: "News", categorySlug: "news", date: "2026-11-14", content: "Content", metaTitle: "Configured title", metaDescription: "Description" };
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } });
  try {
    let res = response(); await createBlog({ body }, res); assert.equal(res.code, 201); assert.ok(res.value.blog.seoUpdatedAt instanceof Date);
    res = response(); await createBlog({ body: { ...body, metaTitle: "", metaDescription: "" } }, res);
    assert.equal(res.code, 201); assert.equal(res.value.blog.seoUpdatedAt, undefined);
    assert.equal(Blog.schema.path("seoUpdatedAt").defaultValue, undefined, "Historical records never receive an invented default date");
  } finally { Blog.findOne = originalOne; Blog.create = originalCreate; }
});
