# OSIRIS developer notes

## Auth and sharing — 19 November 2026

Current request: remove the Google Sites/website CTA, simplify to create → preview → share, and restrict author access to Ryan and Izzat. The prototype structure and core renderer are preserved.

### Implemented

- Clerk email-code sign-in, production instance in invite-only mode. Two existing founder identities are provisioned as reserved/unverified; they must verify their own email during sign-in. No public sign-up flow or Google OAuth yet.
- Every editor/publish request verifies a bearer session, active session status and the verified primary email against `ryanchinqf2@gmail.com` / `mohamedizzatamin@gmail.com`. Origin checks protect writes. UI checks are convenience only. Secrets remain server-side.
- Public build output contains the login shell. The full builder lives in `.private/builder.html` and is included only with the guarded editor function. Public builds still exclude client seed data.
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
- All five Clerk CNAMEs verified. Production frontend HTTPS returns 200, email-code first factor is enabled, registration mode is `restricted`. Founder email-code sign-in is awaiting the user's end-to-end check; no verification codes were accessed by the agent.
- Production runtime error scan after smoke checks returned no error records. No engagement analytics or monitoring drain was added. The temporary Vercel automation bypass created for preview testing was revoked; zero bypasses remain.
