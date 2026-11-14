# Phase 5A product integration contracts

## Public visibility

GET /api/products remains a bare array. A single aggregation joins the actual
category collection and includes only Active products that either have a null
or missing category field (intentional legacy products), or reference an Active
category. Dangling references and inactive-category products are excluded.
The temporary join field is projected out. Hydration retains existing document
serialization/defaults. GET /api/products/admin retains all statuses and existing
authentication/products.view protection.

## Publishing

Only exact string values Active and Draft are accepted when status is supplied.
Invalid supplied values return HTTP 400. An omitted create status retains the
legacy Active default; an omitted update status preserves the stored status.

## Explicit enquiry classification

Products may carry enquiryType: solar or general. Invalid supplied values return
HTTP 400; omission preserves an existing value. The field is optional with no
stored default, so legacy records require no backfill or migration.

New Admin products default to an explicit general enquiry; administrators can
choose solar. Editing an unclassified legacy product offers "Keep existing legacy
behaviour" and omits the field until a type is selected. Once selected, the value
takes precedence over all category-name/slug inference, including on uncategorized
products.

Unclassified legacy records intentionally retain the previous category-based
fallback (including solar for uncategorized records). This preserves existing
solar flows without guessing new classifications or rewriting records. Legacy
classification remains sensitive to category names until an administrator
explicitly classifies the product. No historical quote data is changed.
The existing public quote contract, Contact form and home quote popup are unchanged.

## Assignment/deletion coordination: scope and limitations

Product create/update/delete and category create/update/delete run through the
same process-local promise queue. Each entire operation, including existence and
reference checks and its database write, completes before the next participating
mutation starts. Finally releases the queue on success and failure.

Within one backend process, assignment cannot interleave between category reference
validation and deletion, and deletion cannot interleave between assignment's
category validation and product save. This is deliberately a global queue to avoid
stale reads and multi-category lock-order problems. Long writes serialize other
participating mutations; appropriate operational request/database timeouts remain
necessary.

THIS IS NOT CROSS-INSTANCE ATOMICITY. Separate Node processes, cluster workers,
serverless instances, older deployments and external database writers do not share
this queue. The queue does not repair existing dangling references. Single-writer
operation for all participating writes is an operational prerequisite for relying
on this protection. Multiple writers must not be claimed safe from these changes.

A durable multi-instance guarantee requires separately authorized database work:
a transaction/coordination protocol in which assignment and deletion both perform
a conflicting write on the same category document, with retries and a supported
MongoDB deployment. Merely wrapping the existing reads and writes in independent
snapshot transactions does not eliminate write skew. Database topology and runtime
behavior have not been inspected or tested.

Product/category slug indexes remain separately provisioned requirements; the local
queue does not replace unique indexes across processes. No index creation,
synchronization, migration, seed, database connection or runtime API verification
is part of this phase.
