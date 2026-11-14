import express from "express";
import PageSeo from "../models/pageSeoModel.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { getSeoPages, validSeoPath } from "../utils/seoPages.js";
import { revisionOf } from "../utils/seoDiagnostics.js";
export const publicSeoRouter = express.Router();
export const adminSeoRouter = express.Router();
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const pathOf = (req, res) => {
  const path = req.query.path;
  if (!validSeoPath(path)) { res.status(400).json({ message: "Invalid page path" }); return null; }
  return path;
};
const conflict = res => res.status(409).json({ message: "This content or its SEO changed. Reload the selected item before saving again." });
const recordFilter = record => ({ _id: record._id, updatedAt: record.updatedAt || { $exists: false }, seoTitle: record.seoTitle ?? { $exists: false }, metaDescription: record.metaDescription ?? { $exists: false }, disabled: record.disabled ?? { $exists: false } });
publicSeoRouter.get("/", wrap(async (req, res) => {
  res.set("Cache-Control", "no-store");
  const path = pathOf(req, res); if (!path) return;
  const record = await PageSeo.findById(path).select("seoTitle metaDescription disabled -_id").lean();
  res.json(!record || record.disabled ? {} : { seoTitle: record.seoTitle || "", metaDescription: record.metaDescription || "" });
}));
adminSeoRouter.use(requireAuth);
adminSeoRouter.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
adminSeoRouter.get("/pages", requirePermission("seo", "view"), wrap(async (req, res) => {
  const items = await getSeoPages();
  if (req.query.details !== "1") return res.json(items);
  const known = new Set(items.flatMap(item => [item.pagePath, ...(item.aliases || [])]));
  const records = await PageSeo.find().select("pagePath seoTitle metaDescription disabled updatedAt").lean();
  res.json({ items, asOf: Date.now(), retainedOverrides: records.filter(record => !known.has(record._id)).map(record => ({ pagePath: record._id, seoTitle: record.seoTitle || "", metaDescription: record.metaDescription || "", disabled: Boolean(record.disabled) })) });
}));
adminSeoRouter.get("/", requirePermission("seo", "view"), wrap(async (req, res) => {
  const path = pathOf(req, res); if (!path) return;
  const item = (await getSeoPages()).find(p => p.pagePath === path);
  if (!item) return res.status(404).json({ message: "Content no longer exists at this URL. Refresh the library." });
  res.json(item);
}));
adminSeoRouter.put("/", requirePermission("seo", "view"), requirePermission("seo", "edit"), wrap(async (req, res) => {
  const path = pathOf(req, res); if (!path) return;
  const item = (await getSeoPages()).find(p => p.pagePath === path);
  if (!item || req.body.pageKey !== path || req.body.pagePath !== path || (item.contentId && req.body.contentId !== item.contentId)) return res.status(400).json({ message: "Select existing content at its current URL" });
  const { seoTitle, metaDescription, revision } = req.body;
  if (typeof seoTitle !== "string" || typeof metaDescription !== "string" || seoTitle.length > 300 || metaDescription.length > 2000) return res.status(400).json({ message: "Title must be at most 300 characters and description at most 2000 characters" });
  if (typeof revision !== "string") return res.status(400).json({ message: "Reload content to obtain its current revision" });
  if (item.source === "blog") return res.status(405).json({ message: "Blog Post SEO is read-only here. Edit this article in Blog Admin." });
  const record = await PageSeo.findById(path).lean();
  if (revisionOf(record) !== revision) return conflict(res);
  const values = { pageKey: path, pagePath: path, seoTitle: seoTitle.trim(), metaDescription: metaDescription.trim(), disabled: false, updatedBy: req.admin._id };
  if (!record) {
    try { return res.json(await PageSeo.create({ _id: path, ...values })); }
    catch (error) { if (error.code === 11000) return conflict(res); throw error; }
  }
  const updated = await PageSeo.findOneAndUpdate(recordFilter(record), { $set: values }, { new: true, runValidators: true });
  return updated ? res.json(updated) : conflict(res);
}));
// Reset retains all stored values. It disables an override instead of deleting it.
adminSeoRouter.delete("/", requirePermission("seo", "view"), requirePermission("seo", "delete"), wrap(async (req, res) => {
  const path = pathOf(req, res); if (!path) return;
  const item = (await getSeoPages()).find(p => p.pagePath === path);
  if (!item || item.source === "blog") return res.status(400).json({ message: "Use explicit Blog legacy resolution for Blog overrides" });
  const record = await PageSeo.findById(path).lean();
  if (!record || revisionOf(record) !== req.body.revision) return conflict(res);
  const updated = await PageSeo.findOneAndUpdate(recordFilter(record), { $set: { disabled: true, updatedBy: req.admin._id } }, { new: true });
  return updated ? res.json({ message: "Override disabled; stored values retained" }) : conflict(res);
}));
adminSeoRouter.patch("/legacy", requirePermission("seo", "view"), requirePermission("seo", "edit"), requirePermission("seo", "delete"), requirePermission("blogs", "edit"), wrap(async (req, res) => {
  const path = pathOf(req, res); if (!path) return;
  const item = (await getSeoPages()).find(p => p.pagePath === path && p.source === "blog" && p.contentId === req.body.contentId);
  if (!item || !item.legacyOverrides.some(r => r.pagePath === req.body.legacyPath)) return res.status(400).json({ message: "Select a current Blog and its existing legacy override" });
  const record = await PageSeo.findById(req.body.legacyPath).lean();
  if (!record || revisionOf(record) !== req.body.revision) return conflict(res);
  const updated = await PageSeo.findOneAndUpdate(recordFilter(record), { $set: { disabled: true, updatedBy: req.admin._id } }, { new: true });
  return updated ? res.json({ message: "Blog SEO selected. Legacy values retained in the disabled override." }) : conflict(res);
}));
