# Prototype roadmap, concerns and decisions

> Scope: how this prototype feeds the OSIRIS product. The product plan of record (MVP scope, journeys, pricing spec, Next.js + Supabase architecture) is [`../../devplan.md`](../../devplan.md); current priorities and scope updates are in [`../../devnotes.md`](../../devnotes.md), which take precedence over older proposals.

## Decisions (19 Nov 2026)

1. **Ownership and direction.** Osiris is Ryan and Izzat's project, built to speed up his consulting work, with value beyond Vertical Institute (VI). VI-specific material (logo, course icons, photos, course content, fees, enrolment template) becomes one tenant/template pack, not part of the core product.
2. **Client data.** Published client work moves into a secure database. Until then, real client drafts stay out of git (`data/*.local.js`).
3. **Workflow.** Izzat builds and tests features locally and pushes accepted work to the repo. The partner owns Vercel deployments, UI/UX, auth and analytics.
4. **Hosting.** Paid tiers (Vercel Pro, database, auth) accepted as needed.
5. **Licence.** None yet (all rights reserved by default).

## Product structure

```
User account
 ├── Templates   reusable setups: brand, course catalogue, funding rules, slide set, microsite tabs
 └── Projects    one per client: brief, courses, cohort, funding → generated deck, calculator, survey, enrol, contact
        └── Edit → Publish to client (hosted microsite link; responses and engagement flow back to the project)
```

Mapping from today's code: a **template** is what is hard-coded now (`content.js`, `templates.js` brand constants, `images.js`, `fonts.js`); a **project** is today's draft (`vi-proposal-drafts-v4` in localStorage); **publish** replaces `buildSiteHtml` copy-paste with a hosted link.

## Phase 0: live and safe (now)

- [x] Dissect artifact into modules, byte-identical rebuild
- [x] Strip client data from public builds
- [x] Static deploy config for Vercel with noindex
- [x] Repo on GitHub, Vercel project connected for auto-deploys
- [x] Custom domain: `osirisdeck.com` DNS and HTTPS verified (redirects to www)

## Phase 1: product foundation (partner: UI/UX)

- Template layer: extract brand, colours, logo, contact defaults, course catalogue and funding rules into a template object; VI becomes the first template
- Move fees / SFEC / GST rules out of `templates.js` into versioned data with effective dates
- Unit tests for the funding engine (SFEC current vs Enhanced, multi-UEN, GST, absentee payroll)
- Stack per devplan.md section 8 (TypeScript, Next.js App Router, Supabase). Port the funding engine (`templates.js`) into the pure, tested pricing module; reuse the slide/PDF/PPTX engine (`engine.js`, `runtime.js`) where it fits the shared renderer

## Phase 2: accounts (partner: auth)

- Verified auth with server-managed admin access for the two founders; individual project ownership first, company memberships and collaborator roles after MVP validation
- Accounts own Templates and Projects; projects move from `localStorage` to a secure database (e.g. Postgres via Supabase with row-level security), with an import path for existing `.json` draft exports
- Publish to client: hosted microsites at `<domain>/<organisation>/<project-name>` instead of copy-paste HTML, with per-link expiry and optional passcode
- Survey responses stored in Osiris (Apps Script stays as an optional export to Google Sheets)

## Phase 3: analytics (partner: user-facing analytics)

- Per-microsite engagement: opens, time per slide, calculator scenarios run, survey completion, enrol downloads
- Consultant dashboard: pipeline of sent microsites by status
- Privacy: consent banner, PDPA-compliant retention, no tracking of personal data entered by clients

## Features lost outside claude.ai

- AI-drafted notes (`window.claude.use('sample')`): needs a server-side LLM call (e.g. Anthropic API) behind auth in Phase 2.
- In-artifact download helper (`window.claude.use('downloads')`): browser downloads are used instead; no action needed.
