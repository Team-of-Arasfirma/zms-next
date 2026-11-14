# SEO Control Center — content organization and interactive summaries

## Scope and actual sources

The existing `/admin/seo` dashboard, Admin shell, JWT authentication, RBAC, PageSeo APIs and public metadata functions are retained. No module was rebuilt and there is no new SEO store.

Six distinct groups now appear in the primary library:
1. Pages: the seven existing public main routes.
2. Products: active catalogue products, including the established `item-{ObjectId}` fallback when a custom slug is unavailable or unsafe.
3. Product Categories: active category records.
4. Blog Posts: published articles, with existing Blog SEO fields.
5. Blog Categories: category names/slugs derived from existing published Blog records.
6. Blog Subcategories: parent category plus subcategory names, deduplicated by their actual public path.

There are no separate Blog category/subcategory collections. Their source fields are `category`, `categorySlug`, `subCategory`, and `subCategorySlug` on Blog. Category SEO does not edit those fields or any article SEO. The catalogue deduplicates actual URLs and does not hardcode database content.

Actual article canonicals remain `/{categorySlug}/{slug}`, `/{categorySlug}/{subCategorySlug}/{slug}`, or `/blog/{slug}` where category information is absent. `/blog/{slug}` is also an existing article entry route. The request's `/blog/puf-panels/test-blog` example is not substituted for the actual project's clean article routing.

Blog taxonomy pages remain `/blog/category/{categorySlug}` and `/blog/category/{categorySlug}/{subCategorySlug}`. Existing leaf metadata helpers, canonical construction, title template and fallback text are retained. Server fetches on these category pages also accept the existing server-side `API_URL` configuration, matching the other server helpers.

Career Apply URLs are excluded from the primary library and all summary totals. Their public routes and existing noindex/nofollow behavior are unchanged. Previously saved overrides at excluded URLs remain retained and inspectable in the secondary unmatched-record disclosure.

## Blog Posts: read-only canonical source

The inputs display the exact existing `Blog.metaTitle` and `Blog.metaDescription`. They are native read-only fields, so values remain selectable/copyable. No Save or Reset action is offered for article fields. The SEO PUT endpoint additionally rejects Blog Post edits with 405, including for a super admin: it cannot create a PageSeo article record or update the Blog fields.

Edit in Blog Admin links to `/admin/blogs?edit={ObjectId}`. The server validates the query ID and passes it to the existing Blog editor. After hydration, that editor uses its existing authenticated article loader to open the correct edit modal, with the existing Blog edit permission. All normal Blog CRUD behavior remains available. Refreshing the SEO library fetches the current Blog fields again.

### Deliberate precedence correction

Individual Blog Posts now use:
1. Existing Blog SEO fields.
2. Existing Blog fallback metadata.

The existing root ` | ZMSIPL` title suffix remains unchanged. The Blog metadata helper no longer fetches or applies path overrides to articles. It preserves canonical metadata and synchronizes Open Graph/Twitter text from the Blog metadata.

This intentionally corrects the previous legacy-override-first behavior, as requested. Existing canonical/alias PageSeo records are not deleted, moved or copied. They are shown explicitly as retained, not applied, with both stored values. An authorized administrator can Archive legacy override after confirmation; archival only sets the existing disabled flag and retains its title/description. Blog SEO fields remain unchanged. The legacy archival API retains its revision checks and SEO view/edit/delete plus Blog edit permissions.

Older renamed Blog paths cannot be associated to an ID reliably; unmatched records remain visible for review rather than being guessed or silently removed.

## Categories, subcategories and other content

Blog Categories and Blog Subcategories have independent editable title/description fields, counters, effective search previews, Save, Discard and Reset. They use their own canonical path as the existing PageSeo identity, so one category, child category or article cannot overwrite another's SEO. Nonempty PageSeo fields override only the corresponding existing leaf metadata fields; blank fields retain the existing defaults.

Products, Product Categories and Pages retain that same precedence and existing product structured data, images, canonical URLs and enquiry behavior. Reset disables a PageSeo record while retaining its stored values. A later save reuses the same unique path record. No database migration, index change or production data edit is needed.

Taxonomy slug changes never move records automatically. If an old URL no longer corresponds to current published content, its record is retained in the unmatched disclosure. Stale saves against removed URLs are rejected. If articles still use the old category, that category continues to exist. Reusing an old URL preserves the established path-based identity semantics.

## Summary cards and library filters

All four card totals cover the **entire primary library**, explicitly labelled above the cards. Search, selected content type and status affect the result list, not those global totals. Cards are native semantic buttons with `aria-pressed`, list controls and visible keyboard focus. Enter/Space use native button behavior. The active card has an orange border and subtle background.

- Total Manageable Content clears the summary quick filter; the current tab, search and status dropdown are preserved.
- SEO Configured shows the items whose saved diagnostic status is Configured: custom canonical SEO exists, effective metadata is present and the review checks pass. This includes Blog Posts configured through their existing fields.
- Needs Attention shows Needs Review or Missing Metadata findings, excluding intentional noindex content.
- Recently Updated shows items with a reliable SEO timestamp in the inclusive last seven days, excluding future dates.

Clicking the same active quick-filter card clears it. There is one quick-filter state; results are derived by intersecting it with tab/search/status. Counts, empty states and card totals use the same item snapshots. The library shows `N of M results in {content type}`, announced politely to assistive technology. Zero-result states explain the active filtering/timestamp limitations.

A selection stays open while it remains in the results. A filter that excludes it clears the selection; an unsaved editable draft requires confirmation first. Cancelling leaves the filter and draft intact. Refresh/save reconcile the selection against the new filtered data. In-flight operations disable filter controls to prevent stale selection races. Selecting an item reloads the complete catalogue, including changed Blog fields, to keep counts and diagnostics coherent.

## Reliable SEO update times

General Blog `updatedAt` is never used as an SEO update date. Blog now has an optional `seoUpdatedAt` field:
- New Blog creation with nonempty SEO fields records the initial SEO timestamp.
- Existing Blog Admin updates set it only when metaTitle or metaDescription actually changes.
- Content-only edits preserve it.
- Historical records without this field remain unknown; no backfill or guessed creation/content date is used.

For PageSeo, the existing `updatedAt` is reliable because the record exclusively represents SEO configuration; saves and resets count as SEO configuration updates.

The enriched catalogue exposes `seoUpdatedAt` independently of the general record date. `/api/admin/seo/pages?details=1` also includes a server `asOf` timestamp. Both metrics and list filters evaluate the seven-day window against that same snapshot time, refreshed on each catalogue fetch. This is the evaluation clock, not a substitute for item SEO dates.

Items without a reliable timestamp are excluded from recent results and counted in a visible explanation. When every item lacks one, the card displays Unavailable. Existing Blog records become eligible when their SEO next changes through Blog Admin. None are labelled recently updated merely because their content changed.

## Diagnostics, permissions and preservation

Missing custom fields alone are not errors: valid defaults remain valid. Missing Metadata requires an empty effective title/description. Review checks continue to use actual duplicate effective titles (including shared fallback titles), unusually long titles/descriptions and retained legacy Blog conflicts. A default is not flagged merely because it is a default. The advisory ranges remain 50–60/150–160; storage protections remain 300/2000 for PageSeo writes. No indexing data or arbitrary SEO scores are invented.

SEO reads retain SEO view permission. Editable PageSeo writes retain SEO view/edit; resets retain SEO view/delete. Blog article edits remain in Blog Admin with Blog edit permission and the previous stale-form/concurrent-save guards. Legacy archival requires the existing additional permissions and a matching revision. The public SEO API still exposes only public title/description fields.

Existing public routes, root/Home metadata, canonicals, Open Graph/Twitter metadata, products' structured data, sitemap generation, redirects and Career noindex are preserved. SEO fields are resolved server-side and existing no-store/bounded-failure fallback behavior is retained. Routine edits apply on subsequent server requests without a new deployment.

## Verification and limitations

Automated checks run for this enhancement:
- Backend syntax checks on catalogue, routes and Blog controller.
- `node --test backend/tests/seo.test.js backend/tests/seoControlCenter.test.js backend/tests/productCategoryUploads.test.js`
- Focused ESLint on the enhanced SEO editor, filter/metadata helpers, Blog Admin page and taxonomy route files.
- Production build and `node --test backend/tests/seoHtml.test.js` against a local fixture API.

The isolated suite covers six groups and unique paths, hidden Career Apply, exact Blog field loading, correct article edit URL, read-only API enforcement, category/subcategory save/load/reset isolation, preserved legacy data, RBAC, stale revisions, search/status/quick-filter intersections and toggles, real SEO time windows, unknown timestamps and content-only Blog edits. Existing product-category upload regressions remain included.

The production HTML suite checks Blog canonical/alias field metadata and ignored legacy overrides, independent category/subcategory overrides and fallbacks, title/description/social tags/canonicals, Home fallback, API-failure fallback, product structured data/social images/category canonicals and Career noindex.

All tests use in-memory model stubs or local mock APIs. No MongoDB connection, production data changes, migration, Git operation or deployment was performed. Manual browser interaction, keyboard activation, responsive visual layout, deep-link modal opening and unsaved-change dialogs remain unverified in a real browser. Native button/readOnly semantics, filter functions and backend protections are covered by code/automated checks; those do not substitute for visual acceptance testing. Historical SEO timestamps remain unavailable by design until a genuine SEO change occurs.

## Exact modified files for this enhancement

- `backend/models/blogModel.js`
- `backend/controllers/blogController.js`
- `backend/routes/seoRoutes.js`
- `backend/utils/seoPages.js`
- `backend/utils/seoDiagnostics.js`
- `backend/tests/seo.test.js`
- `backend/tests/seoControlCenter.test.js`
- `backend/tests/seoHtml.test.js`
- `frontend/components/Admin/AdminSeo.jsx`
- `frontend/components/Admin/AdminSeo.module.css`
- `frontend/components/Admin/AdminBlogs.jsx`
- `frontend/app/admin/(panel)/blogs/page.js`
- `frontend/lib/seoControlCenter.js`
- `frontend/lib/pageSeo.js`
- `frontend/app/(public)/blog/category/[categorySlug]/page.js`
- `frontend/app/(public)/blog/category/[categorySlug]/[subCategorySlug]/page.js`
- `docs/seo-management.md`

## Recorded results for this enhancement

- Backend syntax checks passed for the Blog model/controller, SEO catalogue, diagnostics and routes.
- Final isolated suite: 14 tests passed, 0 failed (including eight existing product-category regressions).
- Expanded production HTML suite: 1 test passed, 0 failed.
- Production build passed. Its compiled SEO route bundle was additionally checked to contain the final server snapshot clock, interactive cards, read-only Blog fields and six-group labels.
- Focused ESLint passed for AdminSeo, filter/metadata helpers, the Blog Admin page and both taxonomy route files.
- AdminBlogs lint still reports two pre-existing `react-hooks/set-state-in-effect` findings at the existing fetch effects and one pre-existing `no-img-element` warning. The new deep-link effect/loader did not add findings.
- Manual browser acceptance, responsive visual layout, Enter/Space interaction, correct-modal opening and confirmation dialogs remain unverified. No live database persistence run was performed.
