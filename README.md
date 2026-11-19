# OSIRIS

Interactive presentations and proposals, from a reusable brand template to a client-facing microsite.

**Development baseline · 19 November 2026.** Izzat's working prototype is now in `prototype/`. Its browser runtime, source layout, slide renderer, calculator and export pipeline are preserved. Concept artwork has been removed from the working tree; earlier Git commits retain it.

## Run locally

Use Node.js 22. No application packages need installing.

```sh
cd prototype
npm run build:public
npm run dev
npm test
```

Open the local server URL, or open `prototype/dist/index.html` directly after building. `build` can include private local seed drafts; `build:public` and Vercel builds exclude them. Drafts are stored in this browser only. Export draft JSON for backup; changing from a Vercel hostname to the custom domain does not transfer browser storage.

## Deploy and share

- Repository: [Ryanx-ai/Osiris](https://github.com/Ryanx-ai/Osiris), production branch `main`.
- Live prototype: [osiris-pangea6.vercel.app](https://osiris-pangea6.vercel.app).
- Vercel: project `osiris`, team `Pangea` (`pangea6`), Root Directory `prototype`.
- Build: `node scripts/build.mjs --public`; output: `dist`; framework: Other; Node.js 22.
- Domain: **osirisdeck.com**, purchased. Ryan will connect DNS separately. Keep the production `vercel.app` alias available alongside it.
- Client URL shape: `https://osirisdeck.com/vertical-institute/consultant-name/client-companya`.

The same path works on the production Vercel hostname. [Manual publishing instructions](prototype/published/README.md) explain how to deploy an exported recipient page without changing the builder. Unknown paths return 404; they do not expose the editor. Publishing is currently a reviewed file + Git push, not an in-app button. The public GitHub repository and static published pages must contain only material approved for public access. `noindex` is not access control.

## What works now

The Vertical Institute prototype creates browser-local drafts, interactive decks, calculators, team-scoping pages, enrolment workbooks and contact pages. It exports recipient HTML, PDF and PowerPoint. Survey submission requires a consultant-configured Apps Script service. AI features tied to the original Claude environment are unavailable on ordinary hosting.

There is no OSIRIS login, shared database, admin dashboard or engagement analytics yet. The live builder is a prototype; it does not grant admin privileges or share one user's browser-local drafts with another user.

## Next phases

1. Plan authentication and project storage, with verified admin accounts for Ryan and Izzat.
2. Define OSIRIS branding, UI/UX, website, information architecture and the create-to-share journey.
3. Build the personal MVP: users create projects; **Brand Studio** manages templates; **Deck Builder** edits variables and content for presentations and proposals.
4. Add reliable publishing, recipient interaction and printable PDF output, followed by admin and user-facing engagement analytics.
5. Add company workspaces and collaborators after the personal MVP is proven.

## Project documents

- [Developer notes](devnotes.md): current state, decisions, phased work and release record.
- [Development and design plan](devplan.md): detailed design/architecture proposals, updated scope precedence.
- [Prototype guide](prototype/README.md) and [architecture](prototype/docs/ARCHITECTURE.md): implementation and known limitations.
- [Reference client experience](https://sites.google.com/verticalinstitute.com/hebei-jinbiao-corp-training/hebei-jinbiao-construction-materials): target interaction pattern, not OSIRIS production content.

Ryan and Izzat co-develop OSIRIS. Use focused branches and review changes before merging. No framework migration or visual redesign is part of this import.
