# Phase 5D: Safe offline production build harness plan

Prepared: 2026-11-13. Project: ZMS Website.
Source workspace: Z:\user\Desktop\zms-next (network-backed SMB workspace).

**Status: PLAN ONLY; HARNESS NOT IMPLEMENTED; BUILD NOT AUTHORIZED OR RUN.**
This document defines a proposed minimal application-change design, prerequisites
and acceptance criteria. It does not establish that an isolated build host,
network-denial policy or harness exists. Separate approval is required before
creating harness code, changing an isolated execution environment, or building.

## 1. Goal, boundaries and inspected source

Run the installed Next CLI equivalent of next build --webpack against the exact
current frontend source/dependency snapshot, without actual HTTP/API requests,
MongoDB connections, application/fixture servers, deployments or production
service changes. No application source branch should choose fixture data.

Read-only inspection covered frontend/package.json, backend/package.json,
frontend/next.config.mjs, postcss.config.mjs, eslint.config.mjs, app/layout.js,
app/globals.css, App Router fetch/metadata code, catalogue helpers, blog response
mapping, backend startup/DB configuration and installed Next internals:
- node_modules/next/dist/telemetry/storage.js
- node_modules/next/dist/telemetry/post-telemetry-payload.js
- node_modules/next/dist/lib/worker.js
- node_modules/next/dist/server/lib/patch-fetch.js
- node_modules/next/dist/build/swc/index.js

Installed Next package reports 16.2.10. Installed @next directories include
swc-win32-x64-msvc. Their presence is not proof that binaries load successfully.
The matching Node version/architecture/ABI and complete dependency inventory must
be verified before a future build. No packages were installed or downloaded.

No root package.json was found in the previous release inspection; project scripts
are frontend dev/build/start/lint and backend start/dev. Frontend build is exactly
next build --webpack. No project pre/post-build deployment hooks are defined.
Backend start/dev execute server.js, which calls connectDB and app.listen.
Neither backend entrypoint nor backend application/model code may be loaded.

frontend/AGENTS.md requires following the installed Next documentation. The proposed
harness must be reviewed against the installed version before execution.

## 2. Build-time and runtime network inventory

Do not confuse an emitted URL with an actual build-time request. Conversely,
no-store and force-dynamic are not a universal proof that no build phase can
execute a fetch. The harness must deny unknown requests rather than assume safety.

| Dependency / source | Classification and treatment |
| --- | --- |
| Product landing: components/Product/product.jsx -> lib/productCatalogue.server.js | Server component calls public category and product APIs. Fixture transport required if executed during build. |
| Product/category generateMetadata and pages | Category-by-slug and catalogue lookups. Exact positive/negative fixture URLs; no generic request fallback. |
| Blog landing and category/subcategory pages | Server fetches for blogs, blog categories and subcategories, including query variants. Explicit fixture routes below. Some routes are force-dynamic; coverage must distinguish compilation from execution. |
| app/(public)/blog/[slug]/page.js and [slug]/[...segments]/page.js | Server blog-detail lookups used by generateMetadata and rendering. Same fixture records and canonical relationships across both route forms. |
| sitemap-blog.xml and sitemap-products.xml route handlers | Dynamic public API consumers. Compile unchanged; support fixture calls if executed. Do not pretend compilation executes their GET handlers. |
| Next telemetry | Installed postNextTelemetryPayload calls fetch to telemetry.nextjs.org/api/v1/record and can swallow errors. Disable per process and independently deny/record any attempted telemetry. |
| Native SWC/toolchain fallback | Installed Next code can download native/WASM bindings when absent. Missing/incompatible local dependencies must stop the run, never trigger an online repair. |
| globals.css Google Fonts @import | Remote stylesheet is present in source. It may remain an emitted browser dependency; any compiler/plugin attempt to resolve/download it must fail. Do not silently strip/rewrite it to obtain a green build. |
| Root layout Google Tag Manager / noscript iframe | Browser-time script/iframe URLs, not intended to execute in a CLI build. No browser is launched. Any unexpected build-side request is forbidden. |
| Remote images / Cloudinary | Next Image normally emits references; no image/download fixture server is needed. Fixture image values should use existing local public assets. Unexpected optimizer/network activity fails the build. |
| Client effects: Navbar categories; homepage projects/clients; careers/projects; Admin lists | useEffect/browser/event-driven calls are not intended build-time calls. Do not add permissive empty fixtures merely to conceal unexpected execution. |
| Contact, home QuotePopup, product enquiries, auth and upload mutations | Browser submission paths; all POST/PUT/PATCH/DELETE and authenticated API calls are forbidden in a build. |
| Backend DB, Cloudinary SDK and startup modules | Exclude backend source and credentials from the build sandbox. Block accidental backend/Mongoose/MongoDB imports and all socket access. |
| CSS/PostCSS, webpack, build workers and native subprocesses | Existing config contains local Tailwind PostCSS only, but all subprocess/native paths remain inside the kernel-denied boundary. |
| Canonical URLs, schema.org context, sitemap namespaces and ordinary hyperlinks | String metadata, not network dependencies. Never treat these as permission to fetch those origins. |

Relevant environment dependencies observed in source:
- NEXT_PUBLIC_API_URL, with localhost:5001 fallback: replace ONLY in the disposable
  child-process environment with a synthetic fixture origin.
- NEXT_TELEMETRY_DISABLED: installed storage code disables telemetry when set.
- MONGO_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET and PORT: backend
  runtime settings, not build prerequisites; do not copy them into the sandbox.
- Existing .env files can be auto-loaded by Next. Exclude ALL .env variants from
  staging; do not read, change or copy their secret values.
- HTTP(S)/ALL proxy variables, inherited NODE_OPTIONS/NODE_PATH, tracing/exporter
  settings and user package-manager credentials must not leak into the child.

This inventory is tied to a source/dependency hash. Re-scan server fetches,
dynamic imports, configuration hooks, fonts, instrumentation/proxy files and
dependency versions before every future run. A changed snapshot invalidates approval.

## 3. Recommended isolation: local disposable Windows build sandbox

Use a dedicated disposable Windows VM/sandbox with an already available matching
Node/Windows dependency toolchain, a local disk and an independently enforceable,
auditable network-denial mechanism. Availability is UNVERIFIED. Do not install or
pull an image/tool automatically to satisfy this prerequisite.

The Z: workspace is backed by SMB. Blocking network on a process still reading
that share can break filesystem access or require an unsafe SMB exemption.
Therefore copy an approved frontend/dependency snapshot onto LOCAL guest storage
before isolation. Never build directly on Z: or an inherited UNC/junction target.

Required staging rules:
1. Capture original source/lockfile/config/native dependency hashes, including
   uncommitted files. No Git checkout/reset/branch operation.
2. Copy frontend source, public assets and already installed compatible dependencies
   to disposable local storage. Reject unresolved reparse points, junctions,
   symlinks, native cache paths or file references leading outside the approved
   local snapshot or back to the network share.
3. Exclude .env*, backend/, .git, credentials, prior .next/out artifacts and real
   service configuration. Use empty guest-only caches and an isolated user profile.
4. Keep source snapshot hashes immutable. Build-generated type/cache files may be
   written only in the disposable copy; record any generated-source differences.
5. Verify every required package/native binary is already present and compatible.
   Do not invoke npm install, npm ci, npx, corepack downloads or dependency repairs.
   Windows node_modules cannot simply be reused in a Linux container.

Kernel-enforced boundary:
- No external/routed virtual NIC connectivity or host network proxy/shared tunnel.
- Verified guest/network-compartment policy denies build-process-tree IPv4/IPv6
  TCP, UDP, DNS, raw/alternate socket paths, loopback connections and network
  listeners. No localhost exception, fixture HTTP server or production allowlist.
- All child processes, worker threads, native modules and detached processes must
  inherit confinement. Build runs as an unprivileged identity unable to alter the
  policy. A Windows Job Object/trusted supervisor contains and terminates the tree.
- Existing non-network Node worker IPC/anonymous pipes may be allowed through a
  narrowly reviewed policy. Do not permit HTTP listeners under the name of IPC.
- Trusted policy verification and evidence collection live outside the untrusted
  build process. Failure to install/verify the required policy aborts before Next.

A disconnected NIC alone does not deny loopback. A JavaScript fetch patch,
a dummy API hostname, a generic Windows Firewall default-outbound setting, proxy
settings, or a container --network=none assertion alone is NOT sufficient proof
of the complete boundary. Actual loopback/all-process enforcement must be verified.

Do not change the host's shared firewall, production network, database deployment
or service settings. If the existing isolated environment cannot meet these
requirements, remain blocked and request separately authorized environment setup.
Do not weaken the plan to fit an unverified host.

## 4. Small harness architecture: no runtime source changes

Future harness components, NOT created in this phase:

| Component | Responsibility |
| --- | --- |
| Trusted launcher / policy verifier | Verify local snapshot and isolation before starting Next; own the process tree and evidence channel; refuse unsafe/missing policy. |
| CJS Node preload | Install fixture fetch adapter and deny/record other network and backend/database entrypoints before application/Next evaluation. |
| Immutable fixture manifest/data | Finite URL-to-response mapping with hashes, fixed IDs/dates/content and explicit negative cases. Stored outside frontend app/public imports. |
| Out-of-process evidence supervisor | Record process/thread bootstrap attestations, fixture hits and policy violations; fail even if application/telemetry swallows exceptions. |
| Evidence verifier | Require successful build AND complete coverage/evidence with zero violations; export reports only. |

Invoke the existing installed Next CLI directly rather than through package-manager
hooks. Effective future child command INSIDE the verified sandbox:
~~~text
node C:\stage\frontend\node_modules\next\dist\bin\next build --webpack
~~~

Use a sanitized child environment, not edits to .env or host/user settings:
~~~text
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=https://zms-offline.invalid
NODE_OPTIONS=--require=C:\offline-harness\preload.cjs
~~~

Only approved necessary OS/runtime variables are inherited. CI=1 may suppress
interactive behavior but is not a network control. Remove unrelated inherited
Node options, debugging/listener flags, proxy settings, service secrets and
telemetry/exporter configuration. Do not run next telemetry disable because it
changes persistent user preferences; the per-child variable is sufficient for
the intended telemetry opt-out, with kernel denial as the independent backstop.

Installed Next patchFetch captures globalThis.fetch through createDedupeFetch,
then wraps it. A preload installed early can be its fixture delegate. This is an
implementation opportunity, NOT proof that every worker path is intercepted.

Installed lib/worker.js copies process.env but also parses/reformats NODE_OPTIONS
and merges worker options. Verify actual CJS/ESM workers, worker_threads, child
forks and detached helpers individually. Every expected Node worker must attest
preload version, fixture hash, process/thread ID and run nonce BEFORE app evaluation.
Unattested/unconfined execution fails, rather than assuming inheritance worked.

A monkey patch is an adapter/diagnostic aid, not the security boundary. Native
undici/http/net/TLS/DNS calls, overwritten fetch, subprocesses and imports that
bypass it must still be denied by the OS policy. Deny network bind/listen calls
and accidental backend/Mongoose/MongoDB module entrypoints. No backend code is
needed to compile the frontend.

## 5. Exact fixture transport contract

The preload handles ONLY approved GET requests to the exact synthetic origin
https://zms-offline.invalid. The reserved .invalid name must never be resolved:
fixture responses are constructed in memory, without sockets, DNS or a server.

Normalize Request/string/URL inputs and options consistently. Validate exact
scheme/host/port, method, credentials, canonical path and approved query keys/
values; reject unexpected encodings, traversal, fragments, extra parameters,
authorization/cookies and redirects. Query ordering may normalize to a stable
key; it must not broaden accepted query values.

Every response gets a fresh body/Response instance, fixed JSON data and explicit
status/Content-Type. Deep-clone or deserialize immutable fixture data per request.
Respect pre-aborted signals and body-consumption semantics. No shared mutable
array and no reused consumed Response.

Unknown URL/method/header/query => record a permanent violation and throw.
Never call the original network fetch. Never return []/null/200 for an unknown
request, and never use a wildcard production-host fixture rule.

Some current blog loaders catch errors and return empty results, and telemetry
swallows delivery errors. Therefore throwing alone is inadequate. The trusted
supervisor must retain an append-only violation ledger outside the worker.
Any violation makes the overall run fail even if Next exits zero. Lost/missing
evidence, a failed logger or a guard bootstrap failure must also fail closed.

## 6. Deterministic fixture catalogue

Use only synthetic records, never exports from MongoDB or production APIs.
Use fixed 24-hex string IDs, UTC dates such as 2024-01-01T00:00:00.000Z,
fixed scalar types and stable array ordering. Use existing local public images
after checking exact paths/case; no new image/font downloads.

All cases have a fixture ID, request key, exact status/body hash and contract
assertions. Fixture origin and content contain OFFLINE_FIXTURE_ONLY markers.

### Approved server request families

Each family must resolve to a FINITE enumerated map in the future manifest.
The templates below describe that map, not runtime wildcard permissions.

| Request | Deterministic fixture response |
| --- | --- |
| GET /api/product-categories | Bare array of four Active categories: Solar Mounting Structures, Ventria, Feline Force and Induvex. Valid fixed IDs/slugs/order/descriptions. |
| GET /api/product-categories/{registered-slug} | Matching Active category object. Explicit registered inactive/missing cases return 404 with a message. Unknown unregistered slugs are violations. |
| GET /api/products | Bare array matching the public backend contract: Active products assigned to Active categories plus intentional legacy uncategorized products. No Draft/inactive/dangling records in this public payload. |
| GET /api/blogs | Fixed Published blog summaries with title/slug/categorySlug/subCategorySlug/date/status/coverImage/metaTitle/metaDescription/excerpt; deterministic filtering/order. |
| GET /api/blogs?status=Published | Same approved Published set for the blog sitemap. |
| GET /api/blogs?categorySlug={registered-category} | Finite registered filtered Published list. |
| GET /api/blogs?categorySlug={registered-category}&subCategorySlug={registered-subcategory} | Finite registered matching Published list. |
| GET /api/blogs/categories | Bare array of category, categorySlug and count, matching the observed aggregate response. |
| GET /api/blogs/sub-categories | Bare array of subCategory, subCategorySlug, category, categorySlug and count. |
| GET /api/blogs/sub-categories?categorySlug={registered-category} | Registered category-filtered array with consistent counts. |
| GET /api/blogs/{registered-blog-slug} | Matching detail object with content, image, metadata and timestamps. Explicit registered missing case returns 404. |

Product fixture fields include _id, name, slug where applicable, category where
applicable, enquiryType where explicit, thickness, materialGrade, order, status,
description, image, specifications and fixed createdAt/updatedAt. Cover:
- Explicit solar product assigned to Solar.
- Explicit general products assigned to each other brand.
- Explicit general uncategorized product.
- Legacy uncategorized product without a slug/explicit type, exercising ID fallback.
- Valid named slug and its ID alias resolving to the preferred canonical.

Draft/inactive/dangling/corrupt/duplicate cases belong in separate OFFLINE unit/
contract fixture sets, not as dishonest responses from the Active-only public API.
Do not claim the backend filter is tested merely because a fixture omits Drafts.

Blog fixtures include both category-only and category/subcategory relationships,
valid local cover images, fixed metadata, safe HTML content and consistent counts.
Legacy /blog/{slug} and clean /{category}/{slug} or subcategory URLs must derive
the same canonical from the same record. Keep fixture blog namespaces distinct
from reserved product routes. Current blog missing-record fallback behavior must
be observed, not silently fixed by the adapter.

Negative scenarios use a separate explicit scenario manifest: fixture 404,
bounded synthetic 503 and malformed payload cases. An error scenario does not
count as a successful positive build. No random failures or clock-based responses.

Client-only projects/clients/careers/Admin/auth/upload/quote fetches are DENIED
during the build. If they unexpectedly run during SSR, fail and investigate.
Do not add arbitrary empty responses to make the build pass. Future changes that
add a legitimate server fetch require a reviewed new finite fixture contract.

## 7. Preventing fixture leakage into production

- No application source/config/package-script changes or runtime OFFLINE_BUILD
  branch. Fixtures/preload stay outside app/public and outside normal imports.
- Original production API integrations, canonicals and DB/deployment configuration
  remain untouched. Only the disposable child's API origin changes.
- Exclude service env files/secrets; never point a build at production or localhost.
- Every run is marked OFFLINE-NONDEPLOYABLE regardless of fixture hit count.
  The synthetic NEXT_PUBLIC_API_URL can be embedded in client bundles, and
  prerendered HTML/RSC/cache content can contain fixtures. These are test artifacts.
- Do not export .next, standalone bundles, caches, static chunks or frontend output
  from the disposable sandbox into the original workspace or any release channel.
  Export only an allowlisted evidence report and sanitized logs.
- A clean-looking artifact scan is not promotion authorization: dynamic routes may
  not have used fixtures and markers may be optimized away. All harness artifacts
  remain nondeployable.
- A future production release must rebuild cleanly through its separately approved
  process with authentic inputs. No harness output is promoted.
- Check original source/config/lock/env file content fingerprints before/after.
  Do not create an automatic route from this harness to deployment tooling.

## 8. Fail-closed preflight and run sequence

1. Obtain implementation approval and verified sandbox capability. No capable
   isolated host/policy/toolchain means STOP, not a weakened network policy.
2. Capture source/dependency hashes and exact Next/Node/OS/ABI identities. Detect
   drift and forbid hidden config/instrumentation/proxy hooks or remote paths.
3. Stage the approved local-only snapshot; exclude secrets/backend/prior output.
4. Establish deny-all network/listener confinement and trusted event collection
   before any build child starts. Record policy hash and hypervisor evidence.
5. Under separate harness-test approval, run positive in-memory fixture dispatch
   checks and negative isolation canaries in a separate preflight log/process.
   Canary attempts must be denied before any packet leaves; they are not live
   service probes. Cover DNS, IPv4/IPv6, loopback, alternate HTTP clients, native/
   child bypass, listening and stripped NODE_OPTIONS. A failure means no build.
6. Start a fresh run ledger and launch the direct installed CLI under the policy,
   sanitized environment, preload and contained process tree.
7. Continuously collect bootstrap attestations, fixture hits, violations,
   process creation/exit and OS-level network evidence. No missing child coverage.
8. Await every worker/detached helper, seal logs, and evaluate independent evidence
   even when Next exits zero.
9. Export evidence only, compare untouched original files, then dispose of the
   entire sandbox and ephemeral credentials/environment.

No monkey-patching or network policy is implemented/activated by this document.

## 9. Planned commands and evidence verification

**NOT EXECUTED IN PHASE 5D.** Paths/names are proposed interfaces, not existing
scripts. Native commands depend on an already approved available host/provider;
missing tooling is a blocker, not permission to install or silently skip checks.

Proposed trusted runner interfaces:
~~~text
node C:\offline-harness\runner.cjs preflight --manifest C:\offline-harness\manifest.json
node C:\offline-harness\runner.cjs build --manifest C:\offline-harness\manifest.json
node C:\offline-harness\runner.cjs verify-evidence --run C:\evidence\RUN_ID --require-complete
~~~

The build interface must launch the effective Next CLI shown in section 4 ONLY
after authoritative policy verification. It must not invoke npm install, backend
start scripts, next dev/start, fixture servers, deployment commands or Git writes.

Read-only native evidence queries for the future verification run:
~~~powershell
Get-VMNetworkAdapter -VMName 'ZMS-OfflineBuild' |
  Select-Object VMName, Name, SwitchName, Status

Get-NetTCPConnection |
  Where-Object { $_.OwningProcess -in $buildProcessIds }

Get-NetUDPEndpoint |
  Where-Object { $_.OwningProcess -in $buildProcessIds }

Get-WinEvent -FilterHashtable @{
  LogName = 'Security'
  Id = 5152, 5153, 5156, 5157, 5158, 5159
  StartTime = $runStart
  EndTime = $runEnd
}

Get-Content -LiteralPath 'C:\evidence\RUN_ID\guard-events.jsonl'
Get-Content -LiteralPath 'C:\evidence\RUN_ID\process-attestations.jsonl'
Get-FileHash -LiteralPath 'C:\evidence\RUN_ID\manifest.json' -Algorithm SHA256
~~~

The trusted supervisor supplies run bounds/process tree, authoritative effective
WFP/sandbox policy evidence and DNS/network tracing. Event collection must already
be configured in the disposable guest and verified complete, with loss counters
and applicable provider/version coverage. Security event IDs alone are not a
universal DNS/raw-socket/packet capture solution.

A connection snapshot can miss transient connections. No logged events can mean
logging was disabled. A disconnected adapter says nothing about loopback. These
commands are supporting evidence, not a standalone proof of zero network use.

Acceptance requires ALL of:
- Correct isolation policy established before process creation and unchanged.
- Every build process/thread contained and every expected preload attested.
- Successful kernel/guard negative canaries recorded separately before the run.
- Zero unknown fixture calls and zero guarded network/database/listener attempts.
- Zero prohibited OS-level allowed connections/packets and zero blocked network
  attempts during the BUILD window; attempted-and-blocked telemetry also fails.
- Complete DNS/process/network evidence, no dropped events or missing logs.
- Next exits zero and all child processes exit/are accounted for.
- Expected route/build artifacts recorded, original source untouched and output
  quarantined as nondeployable.

A failed syscall/guard attempt is not successful external access, but it still
fails this harness acceptance. If a library catches the error, the permanent
supervisor ledger must override a green CLI exit. Failures are classified as
isolation, fixture coverage, toolchain, application compilation or baseline lint.

## 10. Scope of verification and determinism

A full successful harness run would verify production compilation under the
reviewed fixture transport and isolation policy, not live production readiness.

Dynamic routes and sitemap GET handlers may compile without executing. Client
effects and form submission do not run in next build. Report each route/path as
compiled, fixture-executed or not exercised; zero fixture hits is not proof that
product metadata, sitemap generation or enquiries were tested.

Optional later approved non-HTTP fixture/code-path probes must run under the same
guard and kernel policy, in a separate evidence window with suitable Next context.
Do not start next start/dev or a mock server to obtain coverage. No such probes
or harness are implemented here.

Deterministic fixtures mean fixed records, IDs, timestamps, order, responses,
scenario selection and source/dependency hashes. Do not globally freeze Date or
timers inside Next to manufacture reproducibility. Default build IDs, timestamps,
absolute paths and native toolchains may still produce byte differences.
Byte-for-byte reproducibility is NOT claimed; it needs a separate reviewed design.

No live DB/auth/cloudinary/API integration, actual index existence, browser fonts/
analytics/images, responsive interactions or production worker topology is tested.
Existing Phase 5C lint findings remain a separate baseline, not evidence of a
new harness regression or a completed production build.

## 11. Cleanup and rollback

After success or failure:
1. Stop the contained process tree and wait for all children/helpers. Flush and
   seal evidence before destroying the guest; record incomplete cleanup as failure.
2. Export only approved evidence/logs with hashes. No deployable build directories.
3. Destroy the disposable local staging area/VM through approved lifecycle controls.
   Validate absolute paths and ownership first; never recursively clean Z:, the
   original UNC workspace, its existing .next or uncommitted source.
4. Discard child-only environment/profile/cache/policy state with the guest.
   No host env file, telemetry preference, shared firewall or production service
   should have been changed, so no production rollback is necessary.
5. Verify original source/config/lock/env content fingerprints and Git status.
   Do not use git reset/clean or reinstall packages to restore the workspace.

Harness rollback after later implementation consists of stopping/quarantining it
and removing only its separately authorized files or isolated artifacts by recorded
ownership. Application runtime integration remains unchanged throughout. Any
unexpected original-file mutation halts work and requires review; do not overwrite
concurrent user changes from an old snapshot.

## 12. Uncertainty and approval gates

Unresolved before implementation/execution:
- Availability of a pre-existing isolated Windows environment and authoritative
  kernel denial covering loopback, children, native code, DNS and listeners.
- Matching local Node/ABI/native dependencies; no online toolchain repairs allowed.
- Complete policy/event/DNS coverage and reliable trusted logging on that host.
- Preload preservation across installed Next worker modes and fetch patching.
- Exact fetches invoked during this version's build; full inventory/allowlist must
  be validated, not widened after a swallowed error.
- Whether CSS/font/toolchain plugins attempt downloads; any such attempt remains
  a failure until separately reviewed.
- Dynamic-route/code-path coverage versus mere compilation; build-ID/time variance.
- Separate permission for harness code, isolation preparation/canaries and an
  actual build. Approval of this plan alone authorizes none of them.

## 13. Phase 5D completion and safety record

Only docs/phase5d-offline-build-plan.md is created. No harness/preload, fixture
files, scripts, OS policies or application changes are created in this phase.

No production build, server, HTTP/API request, MongoDB connection/read/write,
migration, seed, index operation, package installation, environment-file change,
Git mutation or deployment was performed. Existing uncommitted changes are
preserved. Stop after documentation validation and wait for implementation approval.
