# Architecture (v0.2.0, as dissected)

## Runtime model

One static HTML page, no server. Everything (UI, slide rendering, calculations, file generation) runs in the browser.

```
                 ┌──────────────────────── Builder (dist/index.html) ────────────────────────┐
 consultant ───► │ ui.js form + drafts ──► templates.js buildDeck(state) ──► engine.js render │
                 │        │                       │                          │               │
                 │        │                       │                          ├─► PDF  (jsPDF) │
                 │        │                       │                          └─► PPTX (own)   │
                 │        └─► buildSiteHtml / buildHostedHtml / buildCalcOnlyHtml             │
                 │              (inject src/embedded/* + frozen client state as JSON)          │
                 └─────────────────────────────────────┬──────────────────────────────────────┘
                                                       ▼
                     Exported microsite HTML (pasted into Google Sites / any web page)
                     ┌───────────────────────────────────────────────────────────────┐
     client ───────► │ site-app.js tabs: Deck (iframe: hosted-app.js)                │
                     │                   Calculator (iframe: calc-app.js)  ◄─postMessage─►
                     │                   Survey ──► Apps Script web app ──► Google Sheet │
                     │                   Enrol ──► xlsx.js workbook download           │
                     │                   Contact ──► WhatsApp / tel / mailto / vCard   │
                     └───────────────────────────────────────────────────────────────┘
```

## Key entry points

| Function | File | Role |
|---|---|---|
| `buildDeck(state)` | src/js/templates.js | Turns a draft into slide objects (geometry in inches) |
| `buildLines`, `buildImagePptx`, `buildVectorPdf` | src/js/engine.js | Text layout with embedded font metrics, PPTX and PDF writers |
| `exportPdf`, `exportPptx` | src/js/runtime.js | Export actions shared by builder and hosted deck |
| `buildSiteHtml`, `buildHostedHtml`, `buildCalcOnlyHtml` | src/js/ui.js | Assemble exported pages from `src/embedded/*` text blocks |
| `buildSurvey`, `buildEnrol`, `buildContact` | src/embedded/microsite/site-app.js | Client-facing tabs |
| `doPost` | src/embedded/apps-script/Code.gs | Receives survey responses into a Sheet |

`src/embedded/*` is stored in the page as `<script type="text/plain">` blocks and read with `textContent` at export time, so it is never executed by the builder itself.

## State and storage (all `localStorage`, per browser)

| Key | Owner | Holds |
|---|---|---|
| `vi-proposal-drafts-v4` | builder | All drafts (client brief, courses, UENs, SFEC balances, notes) |
| `vi-consultant-v1` | builder | Consultant profile (name, phone, email) |
| `vi-microsite-v1` | builder | Microsite settings (Apps Script URL, tabs) |
| `vi-seed-revs` | builder | Which seeded drafts have been applied |
| `vi-ctc-enhanced-builder-v1` | calculator | Calculator setup |
| `vi-site-<id>`, `vi-site-tour-<id>` | microsite | Client-side survey progress, tour seen |

Consequences: drafts do not sync between devices or people; clearing the browser loses them (Export draft .json is the only backup). This is the main thing an auth + database layer replaces.

## Client data handling

- Seeded client drafts were hard-coded in the artifact. In this repo they live in `data/seed-drafts.local.js` (git-ignored) and are only included in local builds.
- Enrolment personal data (names, NRIC, DOB, phone) is deliberately never collected in the web page; the client fills the Excel offline. Keep this property in any redesign (PDPA).
- Survey responses go to whatever Apps Script URL the consultant configures; Osiris itself stores nothing server-side.

## External dependencies

- Google Fonts (Lato, Merriweather) for the builder UI.
- html2canvas 1.4.1 and jsPDF 2.5.1 from cdnjs with jsDelivr fallback, loaded on demand.
- Embedded fonts Carlito and Caladea (SIL OFL 1.1) for PDF/PPTX layout.
- `window.claude.use('downloads' | 'sample')` when running inside claude.ai only; absent on Vercel.

## Known structural debts (for the rebuild)

- Very large single files (`templates.js` 4.2k lines, `ui.js` 2.1k lines) sharing globals across `<script>` tags.
- Business rules (fees, SFEC tranches, GST, course hours) are mixed into templates; they should become versioned data.
- Brand (colours, logo, copy, photos) is hard-coded to Vertical Institute; needs a tenant/theme layer.
- No tests. The calculation engine is the first thing to cover.
