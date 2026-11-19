# OSIRIS

Create an interactive deck or proposal → Preview → Share link.

The Vertical Institute renderer, calculator, enrolment workbook and PDF/PowerPoint exports remain in `prototype/`. The authoring workspace now requires founder sign-in. Clients view only the version published to their link.

## Use OSIRIS

Open [osirisdeck.com](https://osirisdeck.com). Sign in using an emailed verification code. Access is restricted server-side to verified primary emails:

- `ryanchinqf2@gmail.com`
- `mohamedizzatamin@gmail.com`

Public registration is disabled in Clerk. Google sign-in is a later integration; no passwords or Google OAuth setup are required for this release.

Create or edit a draft, choose **Preview**, then **Share link**. Choose a project name to publish at `https://www.osirisdeck.com/vertical-institute/project-name`. Anyone with the link can view and interact with that version and download a PDF. Links are not secret or recipient-authenticated. Published content is stored in private Vercel Blob, not this public GitHub repository.

Each URL is immutable. Use a new link name (for example `project-name-v2`) for a revision. Existing links keep their original version. Drafts remain browser-local, separated by founder account; they do not sync across computers. **More → Export draft** backs them up. **More → Recover pre-sign-in drafts** copies drafts from the earlier public builder into the current account on the same browser/origin.

The [Vercel alias](https://osiris-pangea6.vercel.app) serves client links too. Its authoring entry points to the canonical `www.osirisdeck.com` sign-in, keeping login and browser drafts on one origin.

## Development

Node 22, npm and an authenticated Vercel CLI are required.

```sh
cd prototype
npm ci
vercel link --project osiris --scope pangea6
vercel env pull .env.local
npm run build:public
vercel dev --listen 3000
npm test
```

Use Clerk's **development** instance for local login; provision approved test identities there separately. Do not enable public signup or put production secrets into source. `.env*`, `.vercel/`, `.private/`, `node_modules/` and `dist/` are ignored. Opening the build directly from disk is no longer an authenticated app.

## Deployment

GitHub: [Ryanx-ai/Osiris](https://github.com/Ryanx-ai/Osiris), production branch `main`. Vercel: project `osiris`, team `pangea6`, root `prototype`, Node 22, install `npm ci`, build `node scripts/build.mjs --public`, output `dist` plus `api/` functions.

Clerk supplies `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` through the Vercel integration. Vercel Blob uses `BLOB_STORE_ID` and deployment OIDC. No storage token is sent to the browser. Production builds exclude local seed drafts. `dist/index.html` is a sign-in shell; builder source and assets are bundled only into the protected editor function, which assembles the HTML after authorization.

## Next phases

Cloud draft/project storage; Google sign-in; admin and user-facing analytics; OSIRIS brand, website and UX; Brand Studio templates; Deck Builder variables for presentations and proposals. Company workspaces and collaborators follow personal MVP validation.

See [developer notes](devnotes.md), [development plan](devplan.md), and [prototype guide](prototype/README.md). Partner handoff documents are historical implementation context; current user requests determine scope.

### Reliability update
Preview now includes **Full screen**. Sharing refreshes authentication and retries temporary failures without reloading your draft. Existing shared URLs retain their published version. See [release checks](docs/RELEASE-AUDIT-2026-11-19.md).

### Author workspace redesign
The [rebuild plan](docs/OSIRIS-REBUILD-PLAN.md) includes research, stack choices and phased acceptance criteria. Review the [interactive author concept](design/index.html), [ten-page brand book](design/brand-book.html) and [handoff notes](design/README.md). These are next-phase design artifacts; production still uses the current author app. Figma population is pending connector quota availability.
