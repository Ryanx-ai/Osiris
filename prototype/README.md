# OSIRIS · Vertical Institute prototype

The existing vanilla-JavaScript deck renderer is preserved. The current author journey is **create → preview → share**. Google Sites embed/export instructions have been removed from the authoring UI.

## Run and deploy

See the [root README](../README.md) for sign-in, environment and Vercel setup. Use Node 22, `npm ci`, `npm run build:public`, and `vercel dev`. A static file server cannot run authentication or publishing. `npm test` runs the access, route and publishing checks.

## Structure

- `src/index.html`, `src/js/ui.js`, `src/styles/builder.css`: existing builder and account-scoped browser drafts.
- `src/login.html`, `src/js/auth.js`: public email-code sign-in shell. No sign-up or Google button in this release.
- `src/js/engine.js`, `templates.js`, `runtime.js`, `content.js`: unchanged core rendering, fees, calculations and export pipeline.
- `src/embedded/`: recipient deck player, calculator, survey/enrol/contact microsite, and optional Apps Script survey endpoint.
- `assets/`: embedded fonts and images.
- `api/editor.js`: verifies an active Clerk session and approved, verified primary email before returning the builder.
- `api/publish.js`: authenticated, same-origin publication. Atomic create prevents overwriting another proposal or a previously shared version.
- `api/publication.js`: reads a private Blob snapshot for `/vertical-institute/:slug`; unknown pages return 404.
- `lib/`: server-side access rules and authentication.
- `scripts/build.mjs`: expands `@@file:…@@`, `@@b64:…@@`, `@@seeds@@`. Public builds always omit real seed drafts. Writes the sign-in shell to `dist/index.html` and server-only builder to `.private/builder.html`.
- `vercel.json`: functions, private builder inclusion, client route rewrite and response headers.

The full builder is mounted in an authenticated shell iframe to preserve the prototype runtime. Recipient HTML is served with a CSP sandbox that cannot access the author's cookies or localStorage. Its scripts, forms, popups and downloads remain available. Recipient progress is not persisted in localStorage inside this isolated page; calculator plan-code export/import still works.

## Sharing boundaries

Anyone with a publication URL can read it. Founder authentication protects authoring and publication, not recipient access. Public links have no passcode, expiry, analytics or revocation UI yet. An operator can withdraw a publication by removing its private Blob record; downloaded copies cannot be recalled. Slugs are unique across both founders. An existing slug accepts only an identical retry by its original author; changes need a new slug.

Snapshots have a 3 MB UTF-8 HTML limit. The normal self-contained export is about 1.7 MB. Drafts and consultant settings stay browser-local and are namespaced by Clerk user ID. Recover older local drafts explicitly from the More menu. Share links can be copied elsewhere, but this release does not provide a cloud project dashboard.

## External dependencies

Clerk handles email-code sign-in; Vercel Blob stores publications. Google Fonts supply author UI fonts. PDF export loads html2canvas/jsPDF from existing CDNs. Survey delivery still uses an optional consultant-configured Apps Script URL. Original `window.claude` features are unavailable on ordinary hosting. Course and SFEC facts retain their original verification dates; this auth/sharing change does not update them.

Google OAuth can be added to the same Clerk application later, while retaining the server-side founder restriction until broader access is explicitly approved. Analytics, templates, the new UI and collaborators are future phases.
