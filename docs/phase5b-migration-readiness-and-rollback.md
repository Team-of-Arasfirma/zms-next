# Phase 5B: Product migration readiness and rollback plan

Prepared: 2026-11-12. Workspace: Z:\user\Desktop\zms-next.

**Decision: NOT AUTHORIZED FOR EXECUTION.** This is a source-based design, not a
database inventory, executable migration, dry-run result or production certificate.
No database connection, record/index inspection, backup, restore, migration, index
build, server, API request or deployment was performed. Every database operation
below requires separate authorization, including read-only discovery and rehearsals.

## 1. Source evidence and limitations

Reviewed the current working tree, including existing uncommitted/untracked work.
Do not assume it is committed or matches production.

| Source | Observed migration implications |
| --- | --- |
| backend/models/productModel.js | Optional ObjectId category, optional slug, optional explicit enquiryType solar/general with no stored default; image/specifications/order and Active/Draft status; timestamps; autoIndex/autoCreate disabled. |
| backend/models/productCategoryModel.js | Name, required unique lowercase slug, description/image, Active/Inactive status and nonnegative safe-integer order; timestamps; automatic index/collection creation disabled. |
| backend/controllers/productController.js | Public aggregation returns Active products only when uncategorized or joined to an Active category. Dangling/inactive assignments are hidden. Omitted category/slug/enquiryType are preserved on update. |
| backend/controllers/productCategoryController.js | Category field allowlist, duplicate preflight checks, and deletion rejection while any product references the category, including Drafts. |
| backend/routes/productRoutes.js | Public GET /api/products; protected GET /api/products/admin; protected multipart product writes. List responses remain bare arrays. |
| backend/routes/productCategoryRoutes.js | Active-only public list/slug lookup; Admin CRUD protected by productCategories permissions. |
| backend/utils/productCategoryMutation.js | One process-local promise queue across participating product/category mutations. Finally releases the queue after success/failure. |
| backend/utils/productSlug.js | Product slug max 200 characters, lowercase alphanumeric words separated by single hyphens. category and item-{24 lowercase hex digits} are reserved. Generation is not uniqueness enforcement. |
| backend/models/quoteModel.js; backend/controllers/quoteController.js | Historical productName/productSlug/categoryName/categorySlug are snapshots, not declared product/category ObjectId foreign keys. Missing enquiryType means solar. Never rewrite these snapshots. |
| frontend/lib/productCatalogue.js | Explicit product enquiryType wins. Unclassified legacy records retain category-name fallback; uncategorized legacy products use solar. |
| frontend/lib/productCatalogue.server.js | Published ID fallback URLs remain available after a named slug is assigned. Previous named slugs have no automatic redirect history. |
| frontend/lib/productSitemap.js | Only valid Active categories and their Active products enter the sitemap; uncategorized records and noncanonical aliases are omitted; 50,000 URL limit. |

Raw BSON contents, collection names, counts, indexes, collection collation, server
version/feature compatibility, sharding, transaction support and real duplicates
remain unknown. Mongoose schema validation/defaults are not proof of stored data.

No deployment manifest, process-manager/cluster configuration, container replica
definition or authoritative worker count was found in the inspected workspace.
backend/server.js calls app.listen once PER LAUNCHED PROCESS; this does not prove
single-process production. CORS hostnames mentioning Render/Vercel and the generic
frontend README do not prove hosting/scaling topology. No environment files were read.

## 2. Proposed four-category taxonomy

These are proposed definitions, not discovered database records.

| Logical key | Category name | Proposed slug | Intended scope | Explicit product enquiry type |
| --- | --- | --- | --- | --- |
| solar_mounting_structures | Solar Mounting Structures | solar-mounting-structures | Approved existing solar product cohort | solar |
| ventria | Ventria | ventria | uPVC Reinforcement | general |
| feline_force | Feline Force | feline-force | False Ceiling Systems | general |
| induvex | Induvex | induvex | Cable Management | general |

- Reuse an existing category _id only after verifying its identity and meaning.
  Never blindly upsert by name, merge categories or replace an existing category.
- Retain an existing valid category slug when approved; proposed slug differences
  require an explicit URL/redirect decision.
- A business owner must approve each existing product _id and target category.
  The requested Solar home for existing products defines an intended cohort; it
  does not establish that every record currently stored is solar.
- Existing non-solar assignments, explicit classifications and ambiguous products
  need individual review. Do not classify solely by product name, slug or the
  fact that a product is already present.
- New brand categories do not authorize inventing products, specifications, images
  or enquiries. Empty brand categories may remain Inactive until content approval.
- Stage genuinely new categories as Inactive. Preserve existing category order and
  status unless explicitly approved. Proposed new category orders 0, 1, 2, 3 follow
  the table order, subject to inventory review. Never renumber product orders.
- Category schema has NO enquiryType field; its controller rejects unknown fields.
  Explicit enquiryType belongs to approved PRODUCT rows.
- Existing explicit enquiryType stays unchanged unless its manifest row approves
  a change. Preserve historical quote snapshots regardless of new category branding.

## 3. Data-preservation rules

Patch existing product records by their existing _id. Never delete/reinsert,
replace full documents, upload images again or import through Admin create routes.

| Data | Required invariant |
| --- | --- |
| Product _id | Same value and BSON type; same product count and identity set. |
| Image | Exact stored value unchanged; no transformation, upload, re-hosting or deletion. |
| Specifications | Preserve all rows, labels/values, row order, BSON types and field presence. Do not trim/filter/rebuild arrays. |
| Product order/status | Exact original value, type and presence; no renumbering or silent Active default. Invalid legacy values require a separate decision, not automatic cleanup. |
| Name/description/materialGrade/thickness and other fields | Unchanged outside an explicit approved field allowlist. |
| createdAt | Preserve exactly. |
| updatedAt/version metadata | Explicitly document forward timestamp/version changes. Recommend genuine modification time for changed rows, no timestamp changes for no-ops, and exact original values available for rollback. |
| category/slug/enquiryType | Only approved changes; distinguish missing, BSON null, empty string and real values. |
| Historical enquiries | No writes, relinking, name/slug rewrites, classification backfill or timestamp/status changes. They contain snapshots rather than declared foreign keys. |
| Categories/indexes | Preserve pre-existing identities/options/metadata unless a specific operation is approved. No implicit merges or index rebuilds. |
| Other collections | Outside scope; whole-database recovery must not erase unrelated later writes. |

Use raw BSON or lossless Canonical Extended JSON for exports and before-images.
Hydrated documents can materialize defaults and hide missing-field distinctions.
Plain CSV or relaxed JSON alone is not an adequate rollback artifact.

Record full before-images plus deterministic protected-field/document hashes.
Canonicalization must preserve BSON numeric/date/ObjectId types and array order.
Hashes are checks, not backups or locks. Current __v is not a universal revision
counter or substitute for a write freeze.

## 4. Authorization gates

All following work is FUTURE work requiring separate approval:

1. Read-only inventory, topology/index discovery and approved exports.
2. Backup creation/access and isolated restore rehearsal. A restore rehearsal is
   itself a database write and is not authorized by this document.
3. Taxonomy, cohort mapping, exact manifests/index definitions, maintenance window,
   source artifact, operators, stop thresholds and rollback authority.
4. Bounded production data writes and explicit index builds.
5. Runtime/API verification, controlled reopening and any rollback execution.

Define named owners/approvers, RPO, RTO, maximum maintenance duration, thresholds,
escalation contacts and communication plan before execution. These are unresolved,
not assumed zero. Approval of this documentation grants no database permission.

## 5. Dry-run validation approach

Prefer offline analysis of an approved frozen export. A later authorized online
dry-run must use read-only credentials and report-only behavior: no saves,
updates/deletes, collection creation, index operations or ODM initialization that
can write. Do not import backend/server.js or backend/app.js. No dry-run executable
is created in Phase 5B.

Inventory ALL products/categories, including Drafts and inactive/orphaned records.
Public APIs are incomplete migration inventories because visibility filters hide
records. Obtain restricted historical enquiry backup evidence without putting
customer contact PII into the product manifest.

| Area | Required validation | Required response |
| --- | --- | --- |
| Identity | Product/category _ids and BSON types; full preimages and hashes. | Block ambiguous/missing identity. |
| Category identity | Proposed taxonomy against existing IDs, names, slugs and all statuses. | Reuse only after review; never merge automatically. |
| Product slugs | Missing, null, empty/whitespace, invalid type, invalid/reserved/overlength, exact duplicates and normalized/case-fold collisions; include Active AND Draft. | Keep healthy values. Every repair requires explicit approval. |
| Category slugs | Same validation across ALL statuses; required scalar slug for every category. | Missing/invalid/duplicate values block index approval. |
| Category references | Missing/null legacy; valid ID to Active/Inactive category; dangling ID; string IDs; arrays/objects/other invalid types. | Do not treat dangling IDs as uncategorized. Hold malformed/ambiguous rows. |
| Product status | Exact Active/Draft, stored type and presence. | Preserve valid values; block/segregate invalid values without normalizing. |
| Category status/order | Exact Active/Inactive and nonnegative safe-integer category order. Inventory product orders without rewriting. | Resolve planned behavior before approval. |
| Enquiry classification | Explicit solar/general, missing/null/invalid type, and before/after effective fallback. | Approve per product; never infer solely from a brand string. |
| Images/specifications | Presence/type, exact URL/value and ordered-array digest. | Preserve even invalid legacy content; remediation is separate scope. |
| Indexes | Key order, unique/sparse/partial/hidden/collation/name/options; collection collation and server compatibility. Check scalar versus array/multikey data. | Resolve conflicts before provisioning. |
| Legacy uncategorized | Per-ID assign Solar, assign another approved category, or remain uncategorized/no-op. | No blanket remapping by name/date/visibility. |
| URLs | Existing preferred named and ID fallback URLs, category URLs, proposed canonical URLs and duplicate-induced changes. | Approve redirects/alias strategy before changing healthy named slugs. |

Default for a valid product with missing/null slug: leave it unchanged and keep its
ID canonical. The partial product slug index permits missing/null scalar values.
There is no need to manufacture a slug merely to populate every field.

If named slugs are explicitly requested, propose deterministic values following
current rules, with an approved stable per-ID suffix only where necessary.
Record exact results before execution; check global collisions, not only the
migrating cohort. Avoid random/run-order suffixes.

Never delete duplicate products/categories merely to create an index. Choose
keepers/renames by approval and preserve all product IDs. Current duplicate-slug
products can all use ID fallbacks, so a named-URL keeper cannot simply be assumed.
Named-slug swaps/cycles need approved temporary values and journaled substeps;
no untracked intermediate renames.

Dry-run deliverables: counts by status/category/type and slug problems, complete
mapping coverage, blockers, category/product/index manifests, URL map, expected
public/sitemap deltas and rollback feasibility. This phase contains no actual
inventory totals, duplicate findings or successful dry-run claims.

## 6. Migration manifest format

Use an immutable approved Extended JSON manifest and a separate append-only
execution journal. The example below is a FORMAT EXAMPLE ONLY. Placeholder IDs
are not actual records or valid execution input.

Envelope fields: manifestVersion, migrationId, preparedAt, sourceArtifactHash,
inventorySnapshotId/hash, backupId/hash, taxonomyVersion, approvedBy/approvedAt,
freezeEvidenceId, productRows, categoryRows, indexRows, URL decisions and bounded
rollbackAuthorization. Credentials and secret connection details belong in
approved secure operational configuration, not a committed manifest.

### Product row example

~~~json
{
  "manifestVersion": 1,
  "migrationId": "<approved-migration-id>",
  "rowId": "<immutable-row-id>",
  "existingProductId": { "$oid": "<existing-24-hex-product-id>" },
  "existingCategory": { "exists": false },
  "targetCategory": {
    "logicalKey": "solar_mounting_structures",
    "resolvedId": { "$oid": "<reused-or-approved-new-category-id>" }
  },
  "existingSlug": { "exists": true, "bsonType": "null", "value": null },
  "proposedSlug": { "exists": true, "bsonType": "null", "value": null },
  "existingEnquiryType": { "exists": false },
  "proposedEnquiryType": { "exists": true, "bsonType": "string", "value": "solar" },
  "action": "assign_category_and_classify",
  "allowedChangedFields": ["category", "enquiryType", "updatedAt"],
  "preconditions": {
    "documentBeforeImageRef": "<restricted-before-image-reference>",
    "documentBeforeHash": "<sha256>",
    "protectedFieldsHash": "<sha256>",
    "statusAndOrderPreserved": true,
    "targetIdentityApproved": true
  },
  "rollback": {
    "restoreFields": {
      "category": { "exists": false },
      "slug": { "exists": true, "bsonType": "null", "value": null },
      "enquiryType": { "exists": false },
      "updatedAt": {
        "exists": true,
        "bsonType": "date",
        "value": { "$date": { "$numberLong": "<original-epoch-ms>" } }
      }
    },
    "requiresDroppingMigrationCreatedIndexFirst": false,
    "expectedAppliedAfterHashRef": "<journal-after-image-hash>",
    "beforeImageRef": "<same-restricted-before-image-reference>"
  }
}
~~~

Field state must distinguish absence, BSON null, empty string, ObjectId, date and
numeric types. When exists is false, rollback unsets the field, not sets null.
An existing category uses exists:true, bsonType:objectId and its Extended JSON value.

Include one row per product _id, even no-op/hold records. Permitted actions:
no_op, hold_for_review, assign_category, classify_enquiry, repair_slug, or an
explicitly enumerated combination. Only approved executable rows run. Holds
require resolution or formal exclusion with a visibility-impact decision.

Category rows: logical key; reuse/create; exact target _id; prior existence and
complete before-image; proposed name/slug/description/image/status/order;
activation step; approval; rollback preconditions; and proof of migration ownership
for new records. Allocate/reuse target IDs in the final approved plan, not through
opportunistic identity matching during execution.

Index rows: collection identity; exact before/after name/key/options/partial filter/
collation; pre-existing flag; validation evidence; creation receipt; whether restoring
original data violates it; and explicit authorization for any conditional removal
of a migration-created index.

Journal: row/substep, attempt, start/end time, preimage checksum, matched/modified
counts, outcome/error, after-image checksum and rollback state. Retries distinguish
untouched, already-applied, conflicted and rolled-back rows. Re-check exact field
preconditions and full preimage under the freeze; mismatches stop rather than
overwrite. A pre-read/hash check alone is not cross-process atomicity.

## 7. Safe index provisioning design

Names below are proposals, not claims about existing database indexes.

| Index | Intended definition | Preconditions |
| --- | --- | --- |
| Product partial unique slug | slug ascending; unique true; partial filter slug has BSON string type; proposed name products_slug_unique_string. | Resolve included duplicates across all statuses, including empty strings. Missing/null scalar values are outside the filter. Reject unexpected invalid/array cases. |
| Category unique slug | slug ascending; unique true; non-sparse/non-partial; proposed name product_categories_slug_unique. | Valid scalar slugs for every category; resolve duplicates/missing/null values across Active and Inactive records. |

The product partial index is not equivalent to sparse uniqueness and does not
validate format, normalization, status or category references. Empty strings
participate. Unexpected arrays/multikey cases must be inspected, not assumed scalar.

Check exact duplicates AND application-normalized trim/lowercase collisions.
The proposed policy is normalized lowercase with simple binary collation.
Inventory real collection/index collations and approve any mismatch; do not
silently substitute a case-insensitive index or rebuild a different existing index.

Keep autoIndex/autoCreate disabled. Do not run syncIndexes, automatic startup index
provisioning or drop/recreate-all-index routines. No executable index commands
are included. Under future authorization:

1. Capture all existing index definitions and ownership before any changes.
2. Verify actual server/topology compatibility, permissions, disk/memory headroom,
   replication health, monitoring and abort/timeout thresholds.
3. Keep all writers frozen while applying approved slug repairs and repeating
   collision checks.
4. Reuse an exactly equivalent index without rebuilding. Same-name/different-options
   or other conflicts stop for explicit replacement and rollback decisions.
5. Provision/verify category uniqueness, then product partial uniqueness.
   A started build is not completed enforcement or replication readiness.
6. Verify exact definitions and completed state on the actual topology. Do not
   insert duplicate production test records to test an index.
7. Do not reopen multiple writers on index evidence alone: uniqueness does not
   enforce category reference integrity.

**Rollback prerequisite:** original duplicate data may violate a NEW unique index.
The rollback plan must explicitly authorize removing only that incompatible
migration-created index, while frozen, BEFORE restoring original duplicates.
Never automatically remove a pre-existing index or the _id index. If an existing
constraint blocks exact restoration, stop for a separate recovery decision.
Hiding an index does not remove its unique constraint.

## 8. Backup verification and production write freeze

### Backup verification

- Capture an authorized consistent pre-change backup, complete index metadata and
  products/categories before-images plus restricted historical enquiry evidence.
  Maintain broader recovery/PITR capability for unrelated collections.
- Record backup ID, UTC cutover, namespace, versions, consistency boundary,
  encryption/access policy, sizes and checksums. Enquiry backups contain PII;
  restrict access and agree retention.
- Verify an isolated restore: counts, IDs, raw BSON/protected-field digests and
  index definitions must match. Record recovery duration against RTO. Backup
  file existence alone is not verification.
- Verify asset recovery separately: image URLs do not restore deleted Cloudinary/
  local files. This migration must not modify assets.
- Rehearse rollback on authorized copies for missing/null values, Drafts,
  uncategorized records, duplicate slugs, timestamps, partial completion and a
  new unique index conflicting with original data.
- After final freeze, repeat authoritative inventory and manifest comparison.
  Drift invalidates previous approval until reviewed.

### Freeze and reader behavior

Freeze product/category writes on ALL instances and writers. Operationally block
their POST/PUT/DELETE endpoints, pause jobs/imports/manual/direct writers, prevent
uncontrolled scaling or rolling writer overlap, drain requests and pending
mutations, and establish exactly one authorized migration writer. Admin UI
read-only mode alone is insufficient.

For strict historical enquiry equality and simpler recovery, include quote
creation/status/deletion in the short approved freeze. Quote-intake downtime must
be communicated and approved. If quotes remain writable, require a separately
approved append-aware/PITR and replay plan; never restore an old quote backup over
new enquiries or claim whole-collection hash equality.

Default: a short public catalogue maintenance window with temporary unavailability,
not fake 404s/empty-success sitemaps. Assigning an Active uncategorized product to
an Inactive staged Solar category immediately hides it under current code.

If downtime is unacceptable, approve another publishing sequence, such as activating
an empty approved target category before reassignment, acknowledging temporary empty
category visibility. A write freeze alone does not hide intermediate data from
readers. Do not promise zero downtime.

The migration runner bypasses the application promise queue. A local lock is not a
production write freeze, durable lease or database lock. Record who verified each
writer stop/drain and the freeze enforcement evidence.

## 9. Reversible execution order: future authorization only

| Step | Action | Required evidence / stop gate |
| --- | --- | --- |
| 0 | Approve topology, source artifact, taxonomy, manifests, operators, window and rollback authority. | No unresolved identity/status/slug/recovery decision. |
| 1 | Verify recovery rehearsal/access; enforce full freeze and drain all writers. | Evidence from all workers/jobs/direct writers; maintenance decisions approved. |
| 2 | Capture authoritative cutover backup, raw inventory and indexes; reconcile/reapprove final manifest. | Frozen checksums/counts/digests; current restore evidence. |
| 3 | Reuse approved categories; create only approved missing categories with planned IDs, staged Inactive. | Existing metadata preserved; new identities journaled. |
| 4 | Apply approved slug repairs only; retain healthy slugs and approved ID canonicals. | Each substep recorded; no ambiguous rename or protected-field change. |
| 5 | Provision/verify category and product unique indexes. | Exact options, completed builds, healthy resources, no unresolved duplicates. |
| 6 | Patch category and explicit enquiryType on existing product _ids in deterministic bounded batches. | Exact expected state; no-op if already applied; stop on mismatch/unexpected counts. |
| 7 | Activate only approved target categories. | Preserve every product status/order; ensure approved Active products are visible; empty brands may remain Inactive. |
| 8 | Validate all post-migration invariants while writes remain frozen. | No unexplained changes, URL losses, orphaned references or index failures. |
| 9 | Approve read reopening, safe writer topology and monitoring, then release freeze in controlled order. | Proven single-writer controls OR durable cross-instance coordination; resumed-write rollback plan. |

A later executor needs explicit patch allowlists, predictable batches, journaled
durable outcomes and write durability suited to the verified topology. Do not use
the existing full Admin PUT as the migration patch: it requires other fields and
saves a full editable representation, increasing preservation risk.
No executable executor is provided in this phase.

## 10. Post-migration validation design

Before reopening writes:

- Same product count and identical _id set; no reinserted/duplicated products.
- Exact protected image/specification arrays, status/order, names, material/
  thickness, description, createdAt and non-allowlisted fields.
- Only approved category/slug/enquiryType/timestamp changes. No-op rows unchanged,
  including missing/null/type distinctions.
- Every changed category reference resolves to the approved target ID; no new
  orphans. Existing exceptions stay explicit, not silently repaired.
- Product Active/Draft values, counts and membership remain unchanged. Invalid
  legacy values have separate approved disposition; no accidental publication.
- Explicit enquiry behavior matches per-ID approvals. Compare before/after legacy
  fallback behavior: assigning a category can change an unclassified product's flow.
- Category identities, metadata, slugs, activation and display orders match rows.
  Do not assume four categories is the complete pre-existing inventory.
- Both unique indexes have approved exact definitions/completed state; no unexpected
  drops/builds; replication/resource health is acceptable.
- Historical enquiries match their frozen identity set, BSON/digests and snapshots.
  If ongoing intake was separately allowed, reconcile additions and preserve every
  pre-cutover record explicitly; do not overwrite them during recovery.
- Under later API authorization, verify public bare arrays, protected Admin all-status
  access, Draft/inactive/dangling exclusion and legacy uncategorized visibility.
  Verify solar/general contracts without creating unwanted production enquiries.
- Under later runtime authorization, compare named/ID URLs, approved redirects,
  category routes, metadata and sitemap membership against the approved URL map.
  Uncategorized products and noncanonical aliases intentionally stay out of the
  product sitemap. Assert planned deltas, not blanket equal URL counts.
- Reconfirm recovery readiness and journal completeness.

These are planned checks, not successful runtime/database verification results.

## 11. Rollback and partial-failure procedure

Pre-agree triggers: unexpected identity/field/status changes, orphan references,
classification regression, unexplained URL/visibility loss, index conflicts,
resource/replication thresholds, missing journal evidence or an unenforceable freeze.

1. Stop batches; retain/reinstate the verified freeze. Capture failure state and
   journal; do not immediately restore the entire database.
2. Identify actual applied substeps from receipts and before/after images.
   Re-read only under authorization. Timeouts/unknown acknowledgements are not
   proof of either failure or success; separate untouched/applied/conflicted rows.
3. Compare current state with recorded after-images. Intervening changes require
   conflict resolution, not blind preimage replacement.
4. Consult index rollback records BEFORE restoring slugs. Remove only explicitly
   pre-authorized, migration-created indexes that would prevent restoring original
   duplicates; preserve all pre-existing indexes.
5. Reverse applied product substeps with exact changed-field preimages and unsets
   for originally missing fields. Restore original category/slug/enquiryType
   presence, updatedAt and explicitly changed version metadata. Keep IDs and all
   unrelated fields unchanged.
6. Restore modified pre-existing category metadata/status/order. Remove a category
   created by this migration only after all references are reversed, none remain,
   identity/after-image match its creation journal and deletion is authorized.
   Never delete a reused category.
7. Reconcile the approved original index inventory. Retaining a compatible new
   index is an explicit deviation requiring approval, not an undocumented rollback.
   Do not start casual index rebuilds.
8. Validate original product identity/protected fields, historical enquiries,
   category state, visibility, enquiry behavior, URLs and index definitions.
   Keep maintenance in place until recovery is verified.
9. If row-level recovery is impossible, use verified backup/PITR only under the
   approved disaster procedure, preferably proving recovery on an isolated target
   first. Whole-production restore can erase unrelated/new writes and requires
   explicit reconciliation and authorization.
10. Reopen only with named approval and writer safeguards. Record recovery duration,
    any accepted deviations and final evidence hashes.

Rollback after writes resume requires a NEW freeze, change capture, conflict
analysis and replay/reconciliation of new dependencies/enquiries. A pre-cutover
snapshot cannot simply replace current production. No unconditional zero-data-loss
claim is made without verified recovery evidence and agreed RPO/RTO.

## 12. Is the process-local queue sufficient?

**Actual deployment topology is unverified. The queue is NOT sufficient as the sole
production safeguard under the evidence available.**

| Deployment/writer situation | Assessment |
| --- | --- |
| One proven process, all relevant writes through current handlers | In-process serialization only; not a migration freeze or unique-index replacement. |
| Multiple instances/workers, rolling releases or serverless | Insufficient: each process has a separate queue. |
| Migration scripts/jobs/manual/direct database writers | Insufficient even with one application process: they bypass the queue. |
| All writers frozen; one authorized migration writer | Freeze/operational controls protect the window, not the queue. |
| Normal multi-writer operation after reopening | Requires durable coordination or a proven, enforced single-writer design. |

Required future discovery: hosting/services/regions, replica/worker counts,
process manager, autoscaling/rolling overlap, every direct/background writer,
MongoDB topology/version/feature compatibility, transaction support and authority
to freeze each writer.

Durable multi-instance consistency requires both assignment and deletion to
participate in a shared protocol. One design is supported transactions with
deliberate conflicting writes on the same category document, retries and fencing
appropriate to the deployment. Independent snapshot transactions that only read
the category can permit write skew. Leases without fencing can leave stale writers.
That engineering/database work is separate and is not installed or verified here.

Unknown topology or uncontrolled writers means NO-GO. Data/index validation alone
does not justify reopening multiple writers.

## 13. Unresolved decisions before execution

- Exact inventory, legacy Solar cohort and business-approved per-ID mappings.
- Existing category reuse/new creation, desired public slugs and empty-brand launch.
- Existing explicit enquiry values versus proposed solar/general classification.
- Whether missing slugs retain ID canonicals (recommended), duplicate/invalid slug
  repairs, URL keeper/redirect decisions and any temporary rename substeps.
- Actual index definitions/collations, duplicate types, server capabilities and
  build resources; index rollback compatibility with original data.
- Actual deployment/writer topology, global freeze enforcement and safe operation
  after reopening.
- Verified backup/PITR/asset recovery, protected enquiry handling, retention,
  RPO/RTO, downtime, owners, stop thresholds and bounded rollback authorization.
- Timestamp/version policy, manifest hashes, batch sizes, idempotency and handling
  of partial outcomes/conflicts.
- Source/build artifact and matching rollback release. Capture current uncommitted
  source hashes or an approved build artifact; do not assume a Git commit exists.

## 14. Phase 5B safety record

This report is the only new artifact, under docs/. No executable migration,
dry-run, seed, index or rollback scripts were created. No frontend/backend source
or environment files were modified; existing uncommitted changes are preserved.

No database connection/read/write, index creation/synchronization, backup/restore,
migration/seed, server, live API request, package install, Git mutation or deployment
was performed. Stop after documentation. Separate authorization is required before
any database or deployment operation.
