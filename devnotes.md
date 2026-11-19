# OSIRIS developer notes

## Core product principle — founder direction, 19 November 2026

**OSIRIS turns a shared proposal or presentation into an interactive decision tool. The client can change relevant variables to explore what fits their own needs.** Client interaction is central to the product and must guide the rebuild, template system, editor and shared experience.

The intended journey is: author creates a proposal → previews the client experience → shares a link → client adjusts available inputs → sees the impact on the proposal → communicates a preferred scenario. The last step is a design requirement; do not imply that client choices already sync back to the author.

### Implications for the rebuild

- Authors define which variables clients can edit, their labels, defaults, units, valid ranges and dependencies. Keep author-only content and commercial rules separate from recipient inputs.
- Clients should easily discover what they can change and see how those changes affect relevant totals, charts, recommendations and proposal content. Show clear calculation/loading/error states; never leave outdated results looking current.
- Preserve the published proposal as the baseline. Client exploration creates a scenario without silently changing the author's draft or another visitor's choices. Provide a clear reset to the original proposal.
- Use one typed variable and calculation model across canvas content, inspector fields, calculators, forms and gizmos. Author preview must expose the same inputs and rules as the shared client view.
- Design save/resume, scenario comparison and “send my preferred configuration” as explicit future capabilities, with defined persistence and submission confirmation. Distinguish exploring a scenario from accepting a proposal.
- Exports should clearly identify the chosen scenario and assumptions. Test that supported PDF outputs match the displayed values; preserve a useful static fallback for interactive components.
- Keep recipient interaction usable on mobile and by keyboard, with labelled controls, input validation and understandable feedback. Retain the current client-facing visual design during the author UI rebuild.

### Existing foundation and acceptance direction

Source review confirms the current client calculator already provides editable inputs, recalculation, entity selection, reset-to-baseline logic and plan-code save/load (`prototype/src/embedded/calculator/calc-app.js`). These are reference behaviours to preserve and generalise. This entry records a source review, not a new live interaction test. Shared-page browser storage remains limited by the sandbox; plan codes do not constitute cloud persistence or author notification.

For each rebuilt interactive template, verify a complete client task: change an allowed input → obtain correct, consistent results → recover from invalid input → reset to baseline → export the supported scenario. Separately verify that recipient changes cannot modify author-only variables or the published baseline. Future analytics should help authors understand client needs and scenario choices, with explicit handling of anonymous visitors and submitted responses.

## Auth and sharing — 19 November 2026

Current request: remove the Google Sites/website CTA, simplify to create → preview → share, and restrict author access to Ryan and Izzat. The prototype structure and core renderer are preserved.

### Implemented

- Clerk email-code sign-in, production instance in invite-only mode. Two existing founder identities are provisioned as reserved/unverified; they must verify their own email during sign-in. No public sign-up flow or Google OAuth yet.
- Every editor/publish request verifies a bearer session, active session status and the verified primary email against `ryanchinqf2@gmail.com` / `mohamedizzatamin@gmail.com`. Origin checks protect writes. UI checks are convenience only. Secrets remain server-side.
- Public build output contains the login shell. The guarded editor function bundles `src/` and `assets/` and assembles its HTML after authorization. `.private/builder.html` is a local build artifact only. Public builds still exclude client seed data.
- Preview uses an isolated recipient iframe with form submission disabled. Share publishes an immutable HTML snapshot to private Vercel Blob in Singapore (`sin1`), using Vercel OIDC rather than a browser storage token.
- Client URL: `/vertical-institute/project-name`. The custom domain redirects apex to www. Production Vercel aliases serve the same client routes; their editor entry links to canonical www sign-in.
- Slug creation is atomic, refuses overwrite, and supports identical retry by the same author. Revisions use a new slug, e.g. `-v2`. No client content is committed to GitHub.
- Published HTML uses CSP sandbox without `allow-same-origin`; active recipient content cannot read author cookies/storage. Scripts, forms, popups, PDF/Excel downloads and print dialogs remain allowed. Responses are no-store and noindex.
- Draft and consultant localStorage keys are scoped to Clerk user ID. Older public drafts remain untouched and can be copied explicitly via More → Recover pre-sign-in drafts.

### Operational configuration

Vercel project `osiris`, team `pangea6`, project ID `prj_JpLiZV1rOb68yu22ADgh7UkbbtKz`; GitHub `Ryanx-ai/Osiris`, production `main`, root `prototype`, Node 22, npm ci. Clerk integration `osiris-auth`; private Blob store `osiris-publications` (`store_lp0bAvuYRZn6SPBe`). Environment files and generated output are ignored.

Clerk production frontend is `clerk.www.osirisdeck.com`; account portal is `accounts.www.osirisdeck.com`. User configured the five CNAMEs in GoDaddy. Both DNS verification and TLS readiness must pass before production sign-in is considered complete. Development/preview use a separate Clerk development instance; production founder accounts do not automatically appear there.

### Remaining limits / next auth work

Drafts do not sync across devices. Public links are accessible to anyone who knows or guesses the path; there is no recipient identity, passcode, expiry, analytics or revocation UI. Operators can withdraw a snapshot through private Blob storage; downloaded copies remain. Sandboxed recipient pages do not retain localStorage progress; plan-code downloads still work. Google OAuth, cloud projects and richer session UX are future work.

Clerk is on its free Hobby plan. Its paid provider-level email allowlist was not enabled; invite-only mode plus the mandatory server-side founder gate enforce access. Do not widen the allowlist or enable registration without a product decision.

### Original import record

Partner commit `3fc3108` was imported with history and authorship. Concept artwork was removed. The Desktop source was deleted only after source comparison and GitHub verification; transport archives remain in ignored `.handoff/`. Source layout, embedded recipient apps and core renderer remain the reference implementation.

## Phase 2 — brand, UX, website and personal MVP

Define OSIRIS positioning, identity, typography, colour, accessible components and mobile recipient layouts before redesigning screens. Website scope: product explanation, examples, workflow, sign-in entry and relevant support/privacy content; keep marketing separate from private authoring and recipient routes.

Information architecture:

- **Projects:** create, duplicate, rename, resume and archive a project; clear draft/published states.
- **Brand Studio:** create and adjust reusable templates, brand assets, layouts, type, colours and default content. VI becomes a template pack rather than the product's hard-coded identity.
- **Deck Builder:** select a template, add variables/client information, configure content and approved recipient inputs; support both presentations and proposals.
- **Publish:** preview desktop/mobile, validate required content and calculations, publish a revision, copy a link.
- **Recipient:** read/present, explore approved options, calculator/scoping/contact as applicable, download/print PDF; no author controls and no account needed for public links.

Validate the main journey: create project → choose template → edit → preview → publish → client interaction → inspect responses. Include empty/error/loading/save-conflict, unavailable/expired publication and PDF fallback states. The linked VI example is the recipient interaction reference; prior research is in devplan section 2. No visual redesign was performed during the handoff import.

## Phase 3 — admin and user analytics plan

Admin: aggregate usage, publication health and authorized engagement inspection. User dashboard: views, unique sessions, slide/section engagement, CTA/contact clicks, calculator interactions, survey completion, enrolment/PDF downloads and responses for owned projects.

Event contract: event ID, event type, publication/revision ID, timestamp, pseudonymous session ID, element/slide identifier and coarse device category. Deduplicate events; distinguish visibility time from idle/background time; label bot filtering and blocked tracking limitations. Never log form text, confidential pricing inputs, credentials or raw recipient personal data as event payloads.

“Who viewed” means verified identity only after a recipient identifies themselves or follows an appropriately authenticated invitation. Anonymous links provide approximate sessions, not a named person. Do not promise that a forwarded link proves identity. Plan notice/consent, retention, deletion and access boundaries before collection. Server-side event validation and ownership checks are required. Print/download counts are best-effort, not proof that a document was read.

## Phase 4 — collaborators, only after MVP validation

Company workspaces, invitations, owner/admin/editor/viewer roles, shared project folders, ownership transfer and audit history. Define invite acceptance, removal and lost-access behaviour. Schema can anticipate memberships, but collaboration and real-time editing remain deferred until personal project creation and publishing are proven.

## Verification and release

Run `cd prototype && npm test && npm run build:public`. Verify browser initialization and recipient HTML export, navigation, calculator and PDF output. Smoke-test the production alias without authentication and verify unpublished paths return 404. Record the final production URL, commit and any remaining checks below after deployment.

### Release evidence — 19 November 2026

- Live: https://osiris-pangea6.vercel.app (also https://osiris-ebon-kappa.vercel.app).
- Initial application release: `6100ddb1b8853635c1a2c3c7a5371086a63a3e7e`, Vercel `dpl_GwUSVVt4dQPbvvpwrEMN1fkhdXoA`, production READY; build about 4.2 seconds. Subsequent documentation-only commits deploy through the same Git integration.
- Unauthenticated production GET: 200; browser initialized with no JavaScript errors. Unknown three-part client path: 404. Verified `noindex`, `nosniff` and referrer-policy headers.
- Two publication tests pass: three-part recipient path isolation, invalid-file/symlink rejection. Public build succeeded with zero client publications. At the initial import, its builder SHA-256 was `19efee1c0fe9c5826bfd0642a406cefe91478539315800a6e4b9ce2ca93da88d`, identical to the imported public builder.
- Exported the built-in fictional example to a recipient microsite; verified Proposal, Calculator, Scoping, Enrol and Contact navigation. After dismissing the onboarding tour, the existing Download → PDF flow produced a 555 KB PDF without JavaScript errors. No real client records were published and no forms/messages were sent.
- Browser smoke checks cover rendering, navigation and export, not the correctness of every funding rule or calculation. No server runtime exists in this static release; analytics/monitoring integration remains planned.
- Domain connection was pending at this initial release; completed and reviewed in the follow-up below.

### Domain and MVP polish — 19 November 2026

- DNS review: apex A records `216.198.79.1` and `64.29.17.1`; www CNAME `9a85d20546bef963.vercel-dns-017.com`. Vercel reports `misconfigured: false` for both. HTTPS apex redirects to www, which serves the app successfully.
- Browser tab title is `Osiris - VI`. Favicon is a white O with a cyan accent on black, embedded in the builder and new recipient HTML exports so standalone exports keep their icon. No core UI redesign.
- MVP publication contract supersedes the original three-part route: `https://osirisdeck.com/vertical-institute/project-name`. Source: `prototype/published/vertical-institute/project-name/index.html`. No consultant segment. No existing client publications require migration.
- Scope stops after these changes and deployment verification. Next planning retains the two founder admin identities, admin/user analytics, website, OSIRIS brand/UI/UX and architecture, Brand Studio templates and Deck Builder variables/content. Presentations and proposals remain supported. Personal MVP: users create projects. Collaborators remain later.
- Verification: all three publication tests and the public build pass. Browser smoke checks confirm the title/favicon in the builder and all three HTML export modes, and a temporary recipient export loads at `/vertical-institute/project-name` with no JavaScript errors. Temporary content was removed after the check; no client publication was added. The HTTPS root-to-www redirect preserves this path.

### Founder auth and in-app sharing release — 19 November 2026

- Implementation commit `f36c982` pushed to GitHub `main`. Production deployment `dpl_9VSuA8B4uBmZUThqBQQUTkJFioht` is READY at `https://www.osirisdeck.com` and production Vercel aliases. Framework remains vanilla JavaScript with Vercel Node functions.
- Eight tests pass: verified founder identity gating; banned/locked/unverified rejection; path/size validation; atomic publication, same-owner retry, collision/ownership protection and storage-failure behavior. Public build succeeds with only the sign-in shell in static output.
- Direct auth checks reject missing and forged sessions (401) and foreign origins (403). Live editor and publish APIs reject unauthenticated requests (401); the private builder path returns 404. Unknown client pages return 404.
- Browser checks: login shell loads Clerk without console errors; local authoring harness covers Preview → Share, the readiness checklist and link creation. Sandboxed client deck and calculator render; PDF export produces a valid 569 KB PDF. The harness does not count as a verified founder login.
- Private Blob roundtrip and atomic overwrite rejection pass. A fictional sample publication returned 200 with isolated HTML on both custom and Vercel hostnames; apex redirects preserve the client path. The sample was removed and both URLs returned 404 afterward. No client proposal or message was sent.
- All five Clerk CNAMEs verified. Production frontend HTTPS returns 200, email-code first factor is enabled, registration mode is `restricted`. The initial founder end-to-end check exposed an editor-loading error, resolved in the follow-up below; no verification codes were accessed by the agent.
- Production runtime error scan after smoke checks returned no error records. No engagement analytics or monitoring drain was added. The temporary Vercel automation bypass created for preview testing was revoked; zero bypasses remain.

### Authenticated editor loading fix — 19 November 2026

The first real founder sign-in exposed a 503 while loading the editor, despite the unauthenticated security checks passing. The editor now assembles HTML from bundled source/assets using module-relative paths, instead of depending on a generated `.private/builder.html` file and the runtime working directory. Build and runtime use one assembler; production never loads local seed drafts. Added safe stage/error-code diagnostics and a Retry button for workspace-loading failures. A regression test reproduces a function bundle with no generated HTML and a different working directory. All nine tests pass.

Production follow-up: fix commit `633b165`, deployment `dpl_FXK8Afp3CZ63RAUYa5x9ZQ4nySm4`, READY. Reloaded the existing verified Ryan session and observed the authenticated OSIRIS builder, draft picker and editing controls. Unauthenticated editor access still returns 401; source, asset and generated-builder URLs remain 404. This closes the first-founder sign-in check.

## 19 Nov 2026 — reliability pass and author fullscreen
Izzat reported intermittent Share link failure resolved by refresh. Added fresh-token publishing, bounded retries with immutable request bodies, timeout/non-JSON error recovery and server stage diagnostics. Added full-screen author preview with a browser-window fallback and iframe permission propagation. Export CDN loads now fail over after a timeout. Client PDF shortcut downloads PDF directly; survey submission distinguishes dispatch from confirmed storage. See `docs/RELEASE-AUDIT-2026-11-19.md` for checks and limitations.
Live release commit `10a566a` deployed as `dpl_7qbvzPUhzNQYXfAFndmCkqWghU8o` (READY). Signed-in browser published a fictional QA snapshot successfully. The custom domain and Vercel alias both served it with the shared-content sandbox; apex redirected preserving the project path; unauthenticated editor returned 401. Full-window preview fallback verified at 1440×844. Native fullscreen was declined in the controlled browser, so cross-browser native fullscreen remains a follow-up check.

The fictional QA publication was deleted after testing; custom and Vercel routes returned 404. Direct private-builder access also returned 404. No test publication remains.

## 19 Nov 2026 — next-phase design package
Prepared `docs/OSIRIS-REBUILD-PLAN.md` and `design/`: research-backed architecture, working scrolling author concept, ten-page SVG/HTML brand book, editable SVG overview and design tokens. Preview embeds the current client renderer with fictional, preview-only data. Desktop and 390px-wide responsive layouts reviewed; project search/grid/list, template selection, preview and concept share dialog exercised. All SVGs parse and concept JavaScript syntax passes. Figma UI metadata confirmed an empty page, then the Starter-plan MCP quota blocked further inspection/editing; no Figma changes made. The existing app mark is provisional until the supplied logo master can be inspected.


## Product structure — founder revision, 19 November 2026

This section is the current feature structure, not a priority list or delivery sequence. It supersedes the earlier sidebar names where they differ. Features described here are planning requirements, not claims that they are already deployed.

### Sidebar — collapsible

| Area | Responsibility |
|---|---|
| Project Folder | Create, open, organise, search and archive projects; grid/list views; each project contains presentation/proposal versions, assets and share links. |
| Brand Elements (Brand Bank) | Approved logos, logo marks, wordmarks, colours, type and reusable brand assets. |
| Template Builder | Create and edit reusable slide layouts, defaults, variables, sections and component constraints; version templates independently of projects. |
| Analytics / Client Spreadsheet | Project/share-link engagement and a client table with client/company, contact, project, status and activity. Visitor identity must be explicit or remain anonymous. |
| Chat | Project/client conversations with scoped access and notifications. |
| Notifications | Relevant project, sharing and conversation events, with read/unread state. |
| Profile | Account identity, workspace context and preferences; keep the two-founder access policy until explicitly expanded. |

Collapsing the sidebar expands canvas space. Icon-only items retain accessible names and tooltips available on hover and keyboard focus. Remember this preference per user/device, keep the active destination apparent, and provide an explicit expand control. No hidden navigation on smaller screens.

### Top bar

- Project name, with rename and a clear save/sync state.
- Preview and Share remain consistently available; Preview shows the client experience, and Share publishes a deliberate version.

### Canvas space

- Presentation / pitch-deck canvas opened from Project Folder; proposals and presentations both supported.
- Calculator and Forms tabs for the project's interactive content, keeping their settings and client preview connected to the same document.
- **AI Meeting Minutes is a core feature for the final public beta.** Adapt the local call-notes capability to an authenticated server-side AI API. Meeting minutes and suggested deck changes are separate reviewable outputs.
- Toolbox for shapes, text, images and **Gizmos**: interactive pie charts, graphs, branch charts and other approved tools/widgets. Each gizmo needs an editable data model, preview behaviour and a defined static PDF/PPTX fallback.
- Slides themselves are directly editable: select, edit text, replace/crop images, move/resize objects and update supported chart data on the canvas. Variables supplement this workflow; they are not the only way to change a slide.

### Right bar

- Context-sensitive editable fields, variables, object properties, tools and gizmo settings.
- Canvas selection and inspector selection refer to the same object and state. Editing in either place updates the other and participates in the same undo/redo history.
- Bound content distinguishes “change everywhere” from a per-slide override. Offer reset-to-variable and show which slides are affected before a global change.

### Brand constraints and digital migration

The approved source is [OSIRIS Logo](https://www.figma.com/design/tGaka8JQGKbav3H4gkiqb0/OSIRIS-Logo?node-id=0-1). **Orange is used only in the logo mark.** Black, white and cyan remain the application foundation; do not reuse logo orange for buttons, selection, charts or decorative accents. Preserve client-template branding independently. Exact orange, wordmark type, geometry and clear space must come from the supplied artwork, not guesses.

See `design/brand-assets/README.md` and `export-plan.json` for the master/mark/wordmark/favicon and digital-size requirements. On this follow-up the Figma connector still returned its Starter-plan quota error. The new artwork has not been inspected or exported; the live favicon/logo and the supplied Figma files have not been changed for this request.

### Existing AI feature and adaptation boundary

Current source: `prototype/src/js/ui.js`, “Draft from call notes” block (`notesPrompt`, `cleanDraft`, `showDraft` and selective apply). It depends on `window.claude.use('sample')`, so it is hidden when that host capability is absent. It extracts priority, executive-summary text, pain points, practice scenarios, lesson applications and focus; it is not yet a complete meeting recorder/transcription service.

Preserve review-before-apply, source-grounded suggestions, known-course/lesson validation, cancellation and manual entry. Add structured minutes (summary, decisions, action owner/due date where stated, open questions) plus proposed deck patches. An authenticated server adapter holds provider credentials; validate model output before showing it and recheck project revision before applying it. Never publish AI changes automatically. Keep notes private to the project, separate from shared-client payloads and engagement analytics.

### Engineering notes

See `docs/OSIRIS-EDITOR-ARCHITECTURE.md` for the proposed object model, direct editing/variable rules, command history, chart data, autosave and AI flow. Reviewed the founder-supplied `Ryanx-ai/toskerapp` and `Ryanx-ai/luna-vault` repositories. Applicable references and source commit links are recorded in the architecture document; no code or dependencies were copied. Adopt panel-state composition, acknowledgement-safe drafts, grouped notifications, immutable brand snapshots and explicit asset export targets where useful. Do not carry over maps/location logic or Luna’s session-local storage as production infrastructure.

Founder timing: rebuild starts **20 November 2026 (Asia/Singapore)**. Today’s changes are planning and asset specifications only; no rebuild was started.


## Approved logo integration — 19 November 2026
Founder supplied Group 1.svg (full lockup) and Group 2.svg (mark), plus a black-background reference. Original paths preserved; exact mark colours are white, cyan #00FFE1 and orange #FF5100. Orange remains mark-only. Wordmark delivered as outlines; font identity is unspecified. Generated 36 SVG/PNG/ICO assets, source/hash manifest and a downloadable brand kit. Updated sign-in and author header logos, favicon source and public ICO/touch icon build outputs; new recipient exports inherit the new favicon. Existing immutable shared snapshots are preserved. Refreshed local concept, brand-book logo guidance and workspace-structure page. Figma placement explicitly deferred until connector access returns. Existing 13 tests and public build pass.


### Header hierarchy refinement — 19 November 2026
Moved the full outlined OSIRIS SVG to the top-left account row at 128px wide (112px on small screens). The main heading is now “Vertical Institute – Client proposal microsite” in larger UI type, below the brand row. Removed the redundant VI badge. Login and client deck layout are unchanged.

### Transparent logo finish — 19 November 2026

Removed the builder logo wrapper's black background, padding and rounded corners. The exact supplied full SVG now sits directly on the workspace background. Header hierarchy commit `0e6f230` and transparency commit `6dc67a4` were pushed to GitHub and deployed to production. The public build passed; the live authenticated builder was visually checked, with the logo confirmed as SVG at 128px wide and its wrapper confirmed transparent with no border. Final deployment: `dpl_77Hz58duAxMRoWYUsY52fJxbA1iu` (READY), serving `www.osirisdeck.com`.
