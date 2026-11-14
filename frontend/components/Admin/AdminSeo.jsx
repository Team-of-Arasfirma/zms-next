"use client";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowLeft, ArrowUpRight, FileText, Layers, Package, BookOpen, CheckCircle2, AlertCircle, Clock3, Globe, Monitor, Smartphone, RefreshCw, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { hasPermission } from "../utils/permissions";
import { SEO_TABS, filterSeoItems, seoMetrics, previewMetadata, toggleQuickFilter } from "@/lib/seoControlCenter";
import styles from "./AdminSeo.module.css";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const icons = { Pages: FileText, Products: Package, "Product Categories": Layers, "Blog Posts": BookOpen, "Blog Categories": Layers, "Blog Subcategories": Layers };
const empty = { seoTitle: "", metaDescription: "" };
const valuesOf = item => ({ seoTitle: item.seoTitle || "", metaDescription: item.metaDescription || "" });
async function request(path, options = {}) {
  const response = await fetch(`${API}/api/admin/seo${path}`, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("zmsAdminToken") || ""}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load SEO settings");
  return data;
}
function Status({ status }) {
  const tone = status === "Configured" ? "good" : status === "Using Default" ? "default" : "warning";
  return <span className={`${styles.badge} ${styles[tone]}`}><span />{status}</span>;
}
export default function AdminSeo() {
  const [items, setItems] = useState([]);
  const [retained, setRetained] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [tab, setTab] = useState("Pages");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [quickFilter, setQuickFilter] = useState(null);
  const [asOf, setAsOf] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mobileEditor, setMobileEditor] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const dirty = Boolean(selected && (form.seoTitle !== selected.seoTitle || form.metaDescription !== selected.metaDescription));
  const dirtyRef = useRef(false);
  const sequence = useRef(0);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => {
    let active = true;
    request("/pages?details=1").then(data => { if (active) { setItems(data.items); setRetained(data.retainedOverrides); setAsOf(data.asOf); } })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const unload = e => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ""; } };
    const click = e => {
      const link = e.target.closest?.("a[href]");
      if (link && link.target !== "_blank" && dirtyRef.current && !window.confirm("Discard unsaved SEO changes?")) { e.preventDefault(); e.stopPropagation(); }
    };
    const traversal = e => {
      if (e.navigationType === "traverse" && e.cancelable && dirtyRef.current && !window.confirm("Discard unsaved SEO changes?")) e.preventDefault();
    };
    const fallbackPop = e => {
      if (!window.navigation && dirtyRef.current && !window.confirm("Discard unsaved SEO changes?")) { e.stopImmediatePropagation(); window.history.go(1); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", click, true);
    window.navigation?.addEventListener("navigate", traversal); window.addEventListener("popstate", fallbackPop, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); window.navigation?.removeEventListener("navigate", traversal); window.removeEventListener("popstate", fallbackPop, true); };
  }, []);
  const mayLeave = () => !dirty || window.confirm("Discard unsaved SEO changes?");
  function updateFilters({ nextTab = tab, nextQuery = query, nextStatus = filter, nextQuick = quickFilter }) {
    if (busy || loading) return;
    const remainsVisible = !selected || filterSeoItems(items, nextTab, nextQuery, nextStatus, nextQuick, asOf).some(item => item.pagePath === selected.pagePath);
    if (!remainsVisible && !mayLeave()) return;
    if (!remainsVisible) { setSelected(null); setForm(empty); setMobileEditor(false); setMessage("Selection cleared because it is outside the current results."); }
    setTab(nextTab); setQuery(nextQuery); setFilter(nextStatus); setQuickFilter(nextQuick);
  }
  async function select(item) {
    if (busy || !mayLeave()) return;
    const current = ++sequence.current;
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await request("/pages?details=1");
      if (current !== sequence.current) return;
      const refreshedAt = data.asOf; setAsOf(refreshedAt);
      setItems(data.items); setRetained(data.retainedOverrides);
      const fresh = data.items.find(value => item.contentId ? value.contentId === item.contentId && value.source === item.source : value.pagePath === item.pagePath);
      if (!fresh || !filterSeoItems(data.items, tab, query, filter, quickFilter, refreshedAt).some(value => value.pagePath === fresh.pagePath)) {
        setSelected(null); setForm(empty); setMobileEditor(false); setMessage("Content changed and no longer matches the current results."); return;
      }
      setSelected(fresh); setForm(valuesOf(fresh)); setMobileEditor(true);
    } catch (e) { setError(e.message); } finally { if (current === sequence.current) setBusy(false); }
  }
  async function refresh() {
    if (busy || !mayLeave()) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await request("/pages?details=1"); setItems(data.items); setRetained(data.retainedOverrides);
      const refreshedAt = data.asOf; setAsOf(refreshedAt);
      const fresh = selected && filterSeoItems(data.items, tab, query, filter, quickFilter, refreshedAt).find(item => selected.contentId ? item.contentId === selected.contentId && item.source === selected.source : item.pagePath === selected.pagePath);
      setSelected(fresh || null); setForm(fresh ? valuesOf(fresh) : empty);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function mutate(method, body, suffix = "") {
    setBusy(true); setError(""); setMessage("");
    let written = false;
    try {
      await request(`${suffix}?path=${encodeURIComponent(selected.pagePath)}`, { method, body: JSON.stringify(body) });
      written = true;
      const data = await request("/pages?details=1");
      const refreshedAt = data.asOf; setAsOf(refreshedAt);
      const fresh = filterSeoItems(data.items, tab, query, filter, quickFilter, refreshedAt).find(item => item.pagePath === selected.pagePath);
      setItems(data.items); setRetained(data.retainedOverrides); setSelected(fresh || null); setForm(fresh ? valuesOf(fresh) : empty);
      setMessage(method === "PUT" ? "Changes saved. New server requests use the saved SEO values." : "Override disabled. Its stored values have been retained.");
    } catch (e) { setError(`${written ? "The change was saved, but refresh failed. Reload the library before editing again. " : ""}${e.message}`); }
    finally { setBusy(false); }
  }
  const canEdit = selected?.source !== "blog" && hasPermission("seo", "edit");
  const canArchive = hasPermission("seo", "edit") && hasPermission("blogs", "edit");
  const canReset = hasPermission("seo", "delete");
  const visible = filterSeoItems(items, tab, query, filter, quickFilter, asOf);
  const metrics = seoMetrics(items, asOf);
  const preview = selected ? previewMetadata(selected, form) : null;
  const legacy = selected?.legacyOverrides || [];
  const activeLegacy = legacy.filter(record => !record.disabled && (record.seoTitle || record.metaDescription));
  const fieldClass = styles.input;
  return <section className={styles.center} aria-busy={loading || busy}>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}><Globe size={14} /> WEBSITE OPTIMIZATION</p><h1>SEO Control Center</h1><p>Manage search visibility and metadata across your website.</p></div>
      <button type="button" className={styles.secondary} onClick={refresh} disabled={busy || loading}><RefreshCw size={15} />Refresh library</button>
    </header>
    <p className={styles.summaryScope}>Summary totals cover the entire library. Quick filters combine with the selected content type, search and status.</p>
    <div className={styles.metrics} aria-label="SEO library quick filters">
      {[[null, "Total Manageable Content", metrics.total, "All library content", FileText], ["configured", "SEO Configured", metrics.configured, "Custom SEO passing review checks", CheckCircle2], ["attention", "Needs Attention", metrics.attention, "Review findings, excluding noindex", AlertCircle], ["recent", "Recently Updated", metrics.total > 0 && metrics.recentUnavailable === metrics.total ? "Unavailable" : metrics.recent, "SEO changes in the last 7 days", Clock3]].map(([key, label, value, detail, Icon]) => <button type="button" key={label} aria-controls="seo-content-list" aria-pressed={quickFilter === key} disabled={loading || busy} className={`${styles.metric} ${quickFilter === key ? styles.activeMetric : ""}`} onClick={() => updateFilters({ nextQuick: toggleQuickFilter(quickFilter, key) })}><div><span>{label}</span><Icon size={18} /></div><strong>{loading ? "—" : value}</strong><p>{detail}</p></button>)}
    </div>
    {!!metrics.recentUnavailable && !loading && <p className={styles.timestampNote}>{metrics.recentUnavailable} items have no reliable SEO update timestamp and are excluded from Recently Updated. General content update dates are not used.</p>}
    {quickFilter && <div className={styles.quickFilterNotice}><span>Quick filter: {quickFilter === "configured" ? "SEO Configured" : quickFilter === "attention" ? "Needs Attention" : "Recently Updated"}</span><button type="button" onClick={() => updateFilters({ nextQuick: null })}>Clear quick filter</button></div>}
    {busy && <p role="status" className={styles.saveNote}>Updating SEO workspace…</p>}
    {error && <div role="alert" className={`${styles.notice} ${styles.error}`}><AlertCircle size={18} /><span>{error}</span></div>}
    {message && <div role="status" className={`${styles.notice} ${styles.success}`}><CheckCircle2 size={18} /><span>{message}</span></div>}
    {!!retained.length && <details className={styles.retained}><summary>{retained.length} saved overrides have no current matching library URL</summary><p>These records are retained. Content may be intentionally excluded (such as Career Apply), renamed, unpublished or deleted. No values were moved or removed automatically.</p>{retained.map(record => <div key={record.pagePath}><code>{record.pagePath}</code><p>{record.seoTitle || "No custom title"} · {record.disabled ? "Disabled" : "Retained at original path"}</p><p>{record.metaDescription || "No custom description"}</p></div>)}</details>}
    <div className={styles.workspace}>
      <aside className={`${styles.library} ${mobileEditor ? styles.hideOnMobile : ""}`} aria-label="Content Library">
        <div className={styles.libraryHeader}><div><h2>Content Library</h2><span role="status" aria-live="polite">{visible.length} of {items.filter(item => item.tab === tab).length} results in {tab}</span></div><span className={styles.iconTile}><Layers size={18} /></span></div>
        <div className={styles.tabs} role="tablist" aria-label="Content types">{SEO_TABS.map(name => { const Icon = icons[name]; return <button key={name} type="button" disabled={busy || loading} role="tab" aria-selected={tab === name} aria-controls="seo-content-list" id={`seo-tab-${name.replaceAll(" ", "-")}`} className={tab === name ? styles.activeTab : ""} onClick={() => updateFilters({ nextTab: name })}><Icon size={14} />{name}<span>{items.filter(item => item.tab === name).length}</span></button>; })}</div>
        <div className={styles.libraryTools}><label className={styles.search}><Search size={16} /><input disabled={busy || loading} aria-label="Search content by name or URL" placeholder="Search name or URL…" value={query} onChange={e => updateFilters({ nextQuery: e.target.value })} /></label><label className={styles.filter}>Status<select disabled={busy || loading} aria-label="Filter SEO status" value={filter} onChange={e => updateFilters({ nextStatus: e.target.value })}>{["All", "Configured", "Missing", "Needs Review"].map(value => <option key={value}>{value}</option>)}</select></label></div>
        <div id="seo-content-list" role="tabpanel" aria-labelledby={`seo-tab-${tab.replaceAll(" ", "-")}`} className={styles.contentList}>
          {loading ? <p role="status" className={styles.emptyList}>Loading content library…</p> : visible.length ? visible.map(item => <button type="button" disabled={busy} key={item.pagePath} aria-pressed={selected?.pagePath === item.pagePath} className={`${styles.contentItem} ${selected?.pagePath === item.pagePath ? styles.selected : ""}`} onClick={() => select(item)}><span className={styles.itemName}>{item.label}<ArrowUpRight size={14} /></span><span className={styles.itemPath}>{item.pagePath}</span><Status status={item.status} /></button>) : <div className={styles.emptyList}><Search size={24} /><p>No matching content</p><span>{quickFilter === "recent" && metrics.recentUnavailable ? "No matches with a reliable SEO timestamp in this view. Refresh or change the filters." : "Try another search, content type, status or quick filter."}</span></div>}
        </div>
        <div className={styles.libraryFoot}><ShieldCheck size={15} /><p>Defaults count as valid metadata. “Missing” means the effective title or description is empty.</p></div>
      </aside>
      <div className={`${styles.editorColumn} ${!mobileEditor ? styles.hideOnMobile : ""}`}>
        <button type="button" className={`${styles.back} ${styles.secondary}`} onClick={() => { if (mayLeave()) { setForm(selected ? valuesOf(selected) : empty); setMobileEditor(false); } }}><ArrowLeft size={16} />Back to content library</button>
        {!selected ? <div className={styles.emptyEditor}><span className={styles.emptyIcon}><FileText size={30} /></span><h2>Select content to manage its SEO</h2><p>Choose a page, category, product or blog from the library. Existing defaults and custom values will appear here.</p></div> : <>
          <div className={styles.editorCard}>
            <div className={styles.contentInfo}><div><p className={styles.eyebrow}>{selected.group}</p><h2>{selected.label}</h2><a href={`https://www.zmsipl.com${selected.pagePath}`} target="_blank" rel="noreferrer">www.zmsipl.com{selected.pagePath}<ArrowUpRight size={14} /></a></div><Status status={selected.status} /></div>
            <div className={styles.source}><ShieldCheck size={15} /><span>{selected.source === "blog" ? "Source: existing Blog SEO fields · read-only here" : selected.hasOverride ? "Source: Admin override with page defaults for blank fields" : "Source: existing page metadata · no active Admin override"}{selected.noindex ? " · noindex preserved" : ""}</span></div>
            {!!legacy.length && <div className={styles.conflicts}><h3><AlertCircle size={17} />{activeLegacy.length ? "Legacy override needs your review" : "Retained legacy overrides"}</h3><p>Blog Post metadata uses the existing Blog SEO fields and fallbacks. Legacy overrides shown below are not applied publicly. Their values are retained for review and can be archived explicitly.</p>{legacy.map(record => <div key={record.pagePath} className={styles.legacyRecord}><strong>{record.pagePath} · {record.disabled ? "Disabled, retained" : "Retained, not applied"}</strong><p><b>Title:</b> {record.seoTitle || "Uses Blog default"}</p><p><b>Description:</b> {record.metaDescription || "Uses Blog default"}</p>{!record.disabled && <div className={styles.actionRow}><button type="button" className={styles.secondary} disabled={busy || !canArchive || !canReset} onClick={() => { if (window.confirm("Archive this legacy override? Its title and description will be retained, disabled. Blog SEO fields will remain unchanged.")) mutate("PATCH", { contentId: selected.contentId, legacyPath: record.pagePath, revision: record.revision }, "/legacy"); }}>Archive legacy override</button></div>}</div>)}</div>}
            <form onSubmit={e => { e.preventDefault(); if (!canEdit) return; mutate("PUT", { ...form, pageKey: selected.pagePath, pagePath: selected.pagePath, contentId: selected.contentId, revision: selected.revision }); }}>
              <fieldset disabled={busy || (selected.source !== "blog" && !canEdit)} className={styles.fields}>
                <div><div className={styles.labelRow}><label htmlFor="seo-title">SEO Title</label><span className={form.seoTitle.length > 70 ? styles.long : ""}>{form.seoTitle.length}<span> / 50–60 recommended</span></span></div><input id="seo-title" readOnly={selected.source === "blog"} className={fieldClass} value={form.seoTitle} maxLength={300} placeholder={selected.defaultTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} aria-describedby="seo-title-help" /><p id="seo-title-help" className={styles.help}>{form.seoTitle.length > 70 ? "This title is unusually long and may be truncated in search results." : !form.seoTitle.trim() ? "Blank uses the existing default title shown in the preview." : "Write a clear, specific title. Length guidance is advisory."}</p></div>
                <div><div className={styles.labelRow}><label htmlFor="seo-description">Meta Description</label><span className={form.metaDescription.length > 180 ? styles.long : ""}>{form.metaDescription.length}<span> / 150–160 recommended</span></span></div><textarea id="seo-description" readOnly={selected.source === "blog"} className={fieldClass} rows={5} value={form.metaDescription} maxLength={2000} placeholder={selected.defaultDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} aria-describedby="seo-description-help" /><p id="seo-description-help" className={styles.help}>{form.metaDescription.length > 180 ? "This description is unusually long and may be truncated." : !form.metaDescription.trim() ? "No custom description. The existing default description will be used." : "Summarize what visitors can expect from this content."}</p></div>
              </fieldset>
              {selected.source === "blog" ? <div className={styles.editorActions}><p className={styles.help}>These are the existing saved Blog SEO values. Edit them in Blog Admin, then refresh this library.</p>{hasPermission("blogs", "edit") ? <a className={styles.primary} href={selected.blogAdminUrl}><BookOpen size={15} />Edit in Blog Admin</a> : <p className={styles.permissionNote}>Blog edit permission is required to open this article’s editor.</p>}</div> : <>
              <div className={styles.editorActions}><div className={styles.actionRow}><button type="submit" className={styles.primary} disabled={busy || !canEdit || !dirty}><Save size={15} />{busy ? "Working…" : "Save Changes"}</button><button type="button" className={styles.secondary} disabled={busy || !dirty} onClick={() => { setForm(valuesOf(selected)); setError(""); setMessage(""); }}>Discard Changes</button></div>{selected.hasOverride && <button type="button" className={styles.reset} disabled={busy || !canReset} onClick={() => { if (window.confirm("Reset this SEO override to page defaults? Stored override values will be retained, disabled. Unsaved changes will be discarded.")) mutate("DELETE", { revision: selected.revision }); }}><RotateCcw size={14} />Reset SEO Override</button>}</div>
              <p className={styles.saveNote}>{dirty ? "● You have unsaved changes" : "Changes apply to new server requests. Refresh an already open website page."}</p>
              {!canEdit && <p className={styles.permissionNote}>Editing requires SEO edit permission.</p>}
              </>}
            </form>
          </div>
          <div className={styles.previewCard}><div className={styles.previewHeader}><div><h2>Search result preview</h2><p>How your content could appear in search</p></div><div className={styles.previewToggle} aria-label="Preview device"><button type="button" aria-label="Desktop preview" aria-pressed={!mobilePreview} onClick={() => setMobilePreview(false)}><Monitor size={16} /></button><button type="button" aria-label="Mobile preview" aria-pressed={mobilePreview} onClick={() => setMobilePreview(true)}><Smartphone size={16} /></button></div></div><div className={`${styles.searchPreview} ${mobilePreview ? styles.mobilePreview : ""}`}><div className={styles.searchBrand}><span>Z</span><div><strong>ZMSIPL</strong><p>https://www.zmsipl.com{selected.pagePath}</p></div></div><h3>{preview.title || "No effective SEO title"}</h3><p>{preview.description || "No effective meta description"}</p></div><p className={styles.previewNote}>Illustrative preview. Google may rewrite titles and snippets.{activeLegacy.length ? " Retained legacy overrides are not applied to Blog Posts." : ""}</p></div>
          <div className={styles.reviewCard}><div><ShieldCheck size={18} /><h2>Metadata review</h2></div>{selected.issues.length ? <ul>{selected.issues.map(issue => <li key={issue}><AlertCircle size={14} />{issue}</li>)}</ul> : <p><CheckCircle2 size={15} />Effective title and description are present; no configured checks flagged this content.</p>}<p className={styles.help}>Checks use saved, effective metadata. Custom fields are optional when defaults are valid. No Google indexing data is available.</p>{selected.updatedAt && <p className={styles.help}>Content record last updated: {new Date(selected.updatedAt).toLocaleString()}</p>}{selected.seoUpdatedAt ? <p className={styles.help}>SEO last updated: {new Date(selected.seoUpdatedAt).toLocaleString()}</p> : <p className={styles.help}>SEO update timestamp unavailable for this record.</p>}</div>
        </>}
      </div>
    </div>
  </section>;
}
