# Osiris prototype: VI Client Microsite Builder v2

> This folder is the **working prototype** that OSIRIS grows from. The product plan of record is [`../devplan.md`](../devplan.md) and the current decisions in [`../devnotes.md`](../devnotes.md). This code is the reference implementation of the recipient experience that plan describes (client microsites like the one reviewed in devplan.md section 2 are its output).

**Client proposal microsite builder.** A consultant enters a client brief once, and Osiris produces everything that client needs to say yes, as one embeddable page:

- **Proposal deck**: 14 slides plus per-lesson detail slides, previewed live, exported to PDF, PowerPoint (.pptx) or a hosted web deck
- **Funding calculator**: course fees, GST, and SkillsFuture Enterprise Credit (SFEC, current and Enhanced) drawdown, including multi-UEN companies
- **Team scoping survey**: a per-participant pre-training survey generated from the chosen courses, posted to a Google Sheet
- **Enrolment**: a pre-filled "Company Sponsored Learners" Excel workbook the client fills in offline (no NRIC or personal data typed into the web page)
- **Contact page**: WhatsApp, call, email (mail app and Gmail) and a vCard

The export is a single self-contained HTML page made to be pasted into Google Sites (or any website) as one embed.

> Origin: built as the "VI Client Microsite Builder v2" Claude artifact for Vertical Institute corporate sales (Nov 2026), dissected into this repo on 19 Nov 2026 as the starting point for a standalone product.

---

## Quick start

```bash
git clone https://github.com/Ryanx-ai/Osiris.git
cd Osiris/prototype
npm run build          # -> dist/index.html (local build, includes your private client drafts if present)
npm run build:public   # -> dist/index.html with no client data (what Vercel serves)
npm run dev            # build + serve on http://localhost:3000
```

Requirements: Node 22. No npm dependencies. Opening `dist/index.html` directly in a browser also works.

## How the code is organised

The app has no framework and no backend. It runs entirely in the browser; drafts live in `localStorage`. The build script stitches the sources back into one file, because the product's output (and the original artifact) is a single self-contained page.

```
prototype/
├── src/
│   ├── index.html                 Page shell: builder markup + @@file:...@@ include markers
│   ├── styles/builder.css         Builder UI styles (light + dark theme tokens)
│   ├── js/
│   │   ├── content.js             Content library: courses, fees, hours, SFEC rules, industry copy
│   │   ├── moddetail.js           Lesson-level detail per course (capabilities, applications, tools)
│   │   ├── engine.js              Slide engine (13.333 x 7.5 in geometry) + PPTX exporter
│   │   ├── templates.js           Slide templates + funding / cohort / multi-UEN calculation engine
│   │   ├── runtime.js             Shared runtime: fonts, images, controls, PDF/PPTX export (builder + hosted deck)
│   │   ├── xlsx.js                In-browser .xlsx writer for the enrolment workbook
│   │   ├── ui.js                  Builder UI: drafts, form, live preview, checklist, exports, microsite assembly
│   │   ├── fonts.js               Embedded font table + glyph widths (fonts live in assets/fonts)
│   │   └── images.js              Embedded image table (images live in assets/images)
│   └── embedded/                  Code that is NOT run by the builder but copied INTO the exported pages
│       ├── hosted-deck/           Web deck clients see (player / scroll / reader layouts)
│       ├── calculator/            Corporate Training Calculator (shell HTML, CSS, app JS)
│       ├── microsite/             The client microsite shell (tabs, survey, enrol, contact)
│       └── apps-script/Code.gs    Google Apps Script web app that receives survey responses into a Sheet
├── assets/
│   ├── fonts/                     Carlito + Caladea (SIL Open Font Licence), used for PDF/PPTX rendering
│   └── images/                    Brand logo/lockup, course icons, marketing photos
├── data/
│   ├── seed-drafts.example.js     Format for pre-loaded client drafts
│   └── seed-drafts.local.js       REAL client drafts: git-ignored, never committed, never deployed
├── scripts/build.mjs              Zero-dependency build: expands @@file / @@b64 / @@seeds markers
├── docs/
│   ├── ARCHITECTURE.md            Runtime model, data flow, export pipeline, external dependencies
│   └── ROADMAP.md                 Concerns, decisions needed, and the product roadmap
├── vercel.json                    Static deploy config (public build, security headers, noindex)
└── package.json
```

### Build markers

| Marker | Replaced with |
|---|---|
| `@@file:<path>@@` | The text of that file (recursively expanded) |
| `@@b64:<path>@@` | That file's bytes as base64 (fonts, images) |
| `@@seeds@@` | `data/seed-drafts.local.js` on a local build; nothing on a public build |

A local build with the seeds file reproduces the original artifact **byte for byte** (sha256 `d624de19…4c12`), which is how the dissection was verified.

## Deploying

Vercel (static, no server):

1. Import `Ryanx-ai/Osiris` at vercel.com/new and set **Root Directory** to `prototype`. Vercel then reads `prototype/vercel.json`: build command `node scripts/build.mjs --public`, output `dist/`.
2. Every push to `main` redeploys; every pull request gets a preview URL.
3. Public builds never contain client drafts (the build also forces `--public` whenever `VERCEL=1`).

The site is served with `X-Robots-Tag: noindex` while it still carries Vertical Institute branding and pricing. Remove that header once the product is white-labelled.

## External services at runtime

| Service | Used for | Notes |
|---|---|---|
| Google Fonts (Lato, Merriweather) | Builder UI typography | CDN |
| cdnjs / jsDelivr: html2canvas 1.4.1, jsPDF 2.5.1 | PDF export | Loaded on demand, with fallback CDN |
| Google Apps Script web app | Survey submissions into a Google Sheet | URL configured per consultant in the builder |
| `window.claude` (only inside claude.ai) | AI-drafted notes, in-artifact downloads | Not available on Vercel: those features degrade gracefully (see docs/ROADMAP.md) |

## Team workflow

- **Izzat** builds and tests features locally (`npm run build`, open `dist/index.html`), on a branch per feature, and pushes once a feature is accepted.
- **Partner** reviews, merges to `main`, owns Vercel deployments, and leads UI/UX, auth and analytics.
- Suggested flow: `feature/<name>` → pull request → `main` → Vercel auto-deploys. Pull requests get Vercel preview URLs for testing before merge.

Target product structure: **User account → Templates | Projects → Edit → Publish to client** (details in `docs/ROADMAP.md`; full product plan in `../devplan.md`).

## Working on it

- Edit files in `src/`, run `npm run build`, open `dist/index.html`.
- Code inside `src/embedded/` is shipped as text and injected into exported files, so test changes there through an export (Preview microsite / Google Sites export), not only in the builder.
- Course facts and SFEC rules are in `src/js/content.js`, each with the date it was last verified. Re-check them against the source sites before relying on them.

## Status

v0.2.0: faithful dissection of the artifact. Single-tenant (Vertical Institute), no auth, no server, no analytics. See `docs/ROADMAP.md` for what has to change before external users.

Licence: none yet (all rights reserved).

## OSIRIS integration — 19 November 2026

See [developer notes](../devnotes.md) for current scope. The source layout and core runtime are preserved. The public build additionally copies reviewed recipient exports from [`published/`](published/README.md) to `/{organisation}/{project-name}`. Run `npm test` for publication-path checks. Brand Studio, Deck Builder redesign, authentication and analytics are planned; collaborator access follows MVP validation.
