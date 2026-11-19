# OSIRIS developer notes

## Current development baseline — 19 November 2026

Ryan's 19 November request is the current scope. Partner handoff documents describe the imported implementation; they do not override that request. The older devplan remains useful design research, with the scope updates here taking precedence.

- Imported partner commit `3fc3108` from the supplied Git bundle on top of existing `main`, preserving authorship and history. The plain prototype folder matched that commit before edits.
- Preserved `prototype/src`, assets, embedded recipient apps and core renderer. Removed `concepts/` and stale artwork links. Added root housekeeping ignores.
- Original transport files are archived locally in ignored `.handoff/`; the code itself is versioned in GitHub. All 60 source files were verified against the imported commit, transport archives were compared, and the Desktop source was deleted after the GitHub push was verified.
- Public builds omit `seed-drafts.local.js` even if present. Build output is regenerated, including only deliberately published recipient HTML from the three-part publication tree.
- Vercel project: `osiris`, team `pangea6`, ID `prj_JpLiZV1rOb68yu22ADgh7UkbbtKz`; GitHub `Ryanx-ai/Osiris`, `main`; root `prototype`; static output `dist`; Node 22.
- Production aliases should be publicly usable. Preview and deployment-specific URLs retain Vercel protection. OSIRIS authentication is a separate future feature.
- `osirisdeck.com` is purchased; Ryan will complete domain/DNS connection later. No registrar changes are part of this import.

## Publishing and routing

URL contract: `/{organisation}/{consultant}/{client-project}`. Use lowercase, hyphenated slugs, for example `/vertical-institute/consultant-name/client-companya`. Reserve the final slug for a distinct project, allowing multiple proposals for one client. Routes are independent of the hostname.

Today: export recipient HTML from the existing builder, review it, place it at `prototype/published/<organisation>/<consultant>/<client-project>/index.html`, then commit and deploy. The public Git repository is unsuitable for confidential proposals. This manual static path has no passcode, expiry or viewer identity. See the publication README. Unknown routes return 404 instead of the builder.

Next: store immutable published revisions and resolve the friendly path to a publication record. Keep stable IDs independent of slugs; enforce uniqueness; provide deliberate republishing, revocation, expiry and optional passcode or verified-recipient access. Friendly slugs are not secrets. Historical revisions need explicit URLs/version identifiers, and removing a static page cannot revoke previously downloaded files or historical deployment URLs.

Use relative links / the current origin for navigation and share links by default. A configured canonical production origin can prefer `osirisdeck.com` after DNS is verified, while both hostnames continue serving content. Browser-local drafts and recipient progress are separate for each origin; export/import JSON during the domain transition.

## Phase 1 — authentication and persistence plan

Initial admin allowlist:

- `ryanchinqf2@gmail.com`
- `mohamedizzatamin@gmail.com`

Implement verified sign-in (Google OAuth or verified email link); map approved identities to server-managed admin roles. Do not infer admin access from an email supplied by browser JavaScript. Protect admin APIs and data with server-side authorization and database policies. Plan invite/recovery, sign-out, session expiry and unauthorized states. These addresses are planned identities, not functioning accounts today.

Target architecture for evaluation: Next.js + TypeScript for the author application and publication routes; Postgres/Supabase Auth and storage as the baseline in devplan. Validate provider choice before implementation. Keep the existing renderer as the reference and extract business rules behind tests before migrating it.

Initial entities: user, personal workspace, brand/template and template revision, project/draft, publication/revision, share access, recipient response and engagement event. Users own projects; tenant boundaries apply to every lookup and write. Preserve draft JSON import/export as the migration path. No company collaboration UI in the personal MVP.

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
- Two publication tests pass: three-part recipient path isolation, invalid-file/symlink rejection. Public build succeeded with zero client publications. Its builder SHA-256 remains `19efee1c0fe9c5826bfd0642a406cefe91478539315800a6e4b9ce2ca93da88d`, identical to the imported public builder.
- Exported the built-in fictional example to a recipient microsite; verified Proposal, Calculator, Scoping, Enrol and Contact navigation. After dismissing the onboarding tour, the existing Download → PDF flow produced a 555 KB PDF without JavaScript errors. No real client records were published and no forms/messages were sent.
- Browser smoke checks cover rendering, navigation and export, not the correctness of every funding rule or calculation. No server runtime exists in this static release; analytics/monitoring integration remains planned.
- Remaining external setup: Ryan connects `osirisdeck.com` in Vercel Domains and applies the exact DNS records Vercel supplies at the registrar. Verify HTTPS and the same publication paths on both origins afterward. Domain routing has not been claimed as tested before DNS connection.
