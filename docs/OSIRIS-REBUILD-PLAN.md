# OSIRIS — author workspace rebuild

19 November 2026 · Proposed direction for Ryan and Izzat

## Product decision
Build a calm workspace for sales consultants to turn a client brief into a branded, interactive presentation or proposal, review it as the client will see it, and publish a dependable link. Preserve the existing client renderer, calculator, forms, navigation and export appearance. Rebuild the author shell and the persistence underneath it in stages.

The MVP is one founder workspace with projects. Collaborator invitations, company folders and roles follow only after the MVP proves useful. Keep the two existing approved emails and invite-only sign-in; Google sign-in can be added later to these same identities without opening registration.

## What research suggests
This is a design synthesis, not a claim that copying another product will improve OSIRIS. Sources were reviewed on 19 November 2026.

| Reference | Observed pattern | OSIRIS decision | Tradeoff |
|---|---|---|---|
| [Linear's 2026 interface refresh](https://linear.app/now/behind-the-latest-design-refresh) | Quiet navigation and consistent placement of page actions | A subdued black sidebar, stable project header and one cyan Share action | Keep labels visible; subdued must not mean low contrast |
| [Figma's editor structure](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) | Navigation, contextual panels, toolbar and scrollable canvas each have a distinct job | Workspace navigation left, document in the centre, selected-section settings right | Avoid adding a second permanent navigation rail on a laptop |
| [Pitch sharing](https://help.pitch.com/en/articles/3748926-share-an-external-link-to-your-presentation) | Named links, custom domains and link-level controls | Share is a managed object with version, status, copy/open and later revoke actions | Keep immutable versions explicit; never silently change a client's approved proposal |
| [Pitch analytics](https://help.pitch.com/en/articles/5592127-view-presentation-analytics) | Activity belongs to a particular share link; identity is conditional | Put engagement inside the project, show anonymous visits honestly | A view does not prove a named person read or understood a proposal |
| [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Advanced options appear when needed | Show essentials first; funding assumptions, lesson overrides and advanced delivery settings expand in the inspector | Critical validation must remain visible before publishing |
| [WCAG target guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Pointer targets need adequate size or separation | Use 40px desktop controls, 44px touch controls, visible labels and focus outlines | Dense author controls still need space and keyboard alternatives |

### Alternatives considered
A dashboard-first KPI wall would be premature before real analytics exist. An infinite freeform design canvas would increase authoring freedom but risk the reliable layouts and funding output that make the current tool valuable. A giant settings form carries forward today's cognitive load. The chosen direction is a structured deck canvas with contextual editing: more visual control, while templates continue to constrain the output safely.

## Author information architecture — revised founder brief
The current structure is maintained in `devnotes.md` under “Product structure — founder revision”. It supersedes the first visual concept's navigation.

- **Collapsible sidebar:** Project Folder; Brand Elements (Brand Bank); Template Builder; Analytics / Client Spreadsheet; Chat; Notifications; Profile. This is a grouping, not a release order.
- **Top bar:** project name, save state, Preview and Share.
- **Canvas:** directly editable presentation/proposal slides, Calculator and Forms tabs, AI Meeting Minutes, and a toolbox for text, shapes, images and interactive gizmos.
- **Right bar:** properties, variables and tools for the selected object or gizmo. Direct canvas edits and inspector edits share one document model and undo history.

Template Builder is now a distinct destination. Project Folder provides grid/list views. A dashboard can be reconsidered later; it is not required by the revised sidebar. The current HTML concept is a visual baseline, not an implementation of this revised feature set.

Direct slide editing is a core requirement. Templates provide useful defaults and guardrails while users can edit supported slide objects directly. Variables make repeated changes efficient and must provide explicit global-versus-local override controls. See `OSIRIS-EDITOR-ARCHITECTURE.md` for the model and interaction rules.

## Primary journey and states
1. New project → choose Presentation or Proposal → choose a Brand Bank template.
2. Enter client/project name → create server project → open canvas at Cover.
3. Edit brief, programme and variables → update renderer → show Saving / Saved / Offline / Conflict with a recovery action.
4. Preview → full screen if useful → inspect calculator/forms/exports using preview mode.
5. Share → readiness checks → choose `/vertical-institute/project-name` → publish a frozen version → copy/open link.
6. Reopen a project later → edit a new draft → publish a new version deliberately. Link management explains whether a new URL is created or an existing link's target is explicitly updated in a future release.

Failures: preserve edits on failed saves; retry a publish with an idempotency key; distinguish duplicate slug from service failure; keep the editor visible on session expiry while offering sign-in recovery. A stale browser tab must not overwrite a newer server version. Offline changes are a recoverable local queue, not a false “Saved” badge.

## Recommended stack
**TypeScript + React + Next.js, CSS variables, PostgreSQL, Clerk and Vercel Blob.** Use one language across UI and app APIs. A small set of accessible headless UI primitives can handle dialogs, menus and tooltips; the OSIRIS styling remains custom. Pin supported versions at implementation time and check compatibility rather than starting with an unreviewed generated stack.

Next.js provides a server-backed author app on the existing Vercel hosting. Keep authorization near data access, consistent with [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication). Clerk remains the identity provider, avoiding an unnecessary account migration. PostgreSQL stores projects and versioned structured content; Blob stores assets and frozen publications. Python is optional later for document processing or batch analysis; it adds no clear value to the present authoring path.

Separate packages/modules:
- `domain`: versioned Project, DeckDocument, BrandTemplate and publication schemas; validation and migrations.
- `renderer`: existing engine/templates/calculator preserved behind a typed adapter. Golden fixtures prove equivalence.
- `author`: React workspace shell, project library, inspector, readiness checks and canvas.
- `server`: authorized project operations, version creation, publication, link management and events.
- `tokens`: shared CSS/Figma values and component documentation.

Suggested records: Workspace, User, Project, DocumentVersion, BrandTemplateVersion, Asset, ShareLink, PublishAttempt, AuditEvent. A later Membership table adds roles; it does not change the public URL hierarchy. Every private operation checks workspace ownership on the server. Published HTML remains isolated from author cookies and storage.

## Phased delivery and exit criteria
| Phase | Deliverable | Exit check |
|---|---|---|
| 0 · Preserve | Snapshot current renderer, export fixtures and draft schemas; map every existing feature | Old/new adapters produce the same client slides, calculations and export content |
| 1 · Foundation | Typed domain, founder auth, Postgres projects, browser-draft import, revision-aware autosave and backup | Ryan and Izzat can reopen the same authorized project on another device; no lost updates; cross-account access rejected |
| 2 · Author workspace MVP | Project Folder, Brand Elements, grid/list files, directly editable canvas, inspector, Preview and Share | Both founders complete a sales proposal without instructions; publish and reload recovery work |
| 3 · Brand Studio | Template versions, approved tokens, reusable sections, protected defaults | A template change does not alter previously published proposals |
| 4 · Measurement | Project/link activity, view/click/download events, optional identified access | Counts distinguish visits, people and bots; no personal identity inferred from IP alone |
| 5 · Collaboration | Invitations, roles, company folders, notifications and scoped client chat | Role matrix, invitation expiry, revoked access and message visibility pass tests |
| 6 · Public website | Marketing site, product story and onboarding connected to the proven product | Claims match shipped features; registration policy is intentional |

Notifications and Chat are included in the revised structure; the initial concept labels these later-phase features. Do not activate paid services or open registration simply to make these screens look populated.

## Analytics model
Measure `publication_opened`, `slide_viewed`, `cta_clicked`, `pdf_download_requested` and calculator interactions at a useful, limited granularity. Treat download requested differently from a completed file save. Use publication/version IDs, deduplicate noisy repeats, avoid recording form answers, financial assumptions or message contents as analytics payloads. Anonymous sessions stay anonymous unless the visitor deliberately provides identity. Plan retention, consent and access controls before production collection. Founder/admin reporting comes first; user-facing reporting follows.

## Design system
Black `#000000`, white `#FFFFFF`, cyan `#62DDEB`; charcoal surfaces `#141719`, border `#30363B`, secondary text `#AEB8BF`. Cyan identifies selection, focus and the principal next action. Use dark text on cyan; reserve white for the actual deck canvas and high-priority text. The existing client brand stays in the rendered document.

Typography: Inter for controls and body, with an Arial/system fallback; display headings use the same family to reduce font loading and keep the product calm. 14px controls, 16px comfortable body, 24/32px section and page headings. An 8px spacing rhythm with 4px subdivisions, 8px controls and 12px panels. Real outline icons always have labels on core navigation. Motion is functional and brief, disabled for reduced-motion preferences.

Orange is reserved exclusively for the logo mark; do not add it to application UI accents. The exact shade and wordmark typography await inspection of the supplied master. The logo in the supplied Figma file remains authoritative. Because the connector quota prevented inspection, local concept assets use the existing app's ring mark as a provisional reference, not a replacement logo.

## Verification and rollout
Maintain fixtures for single/multiple courses, multiple entities, unknown funding, legacy/enhanced modes, exact cohort split, lesson links, slide ordering, empty and long content. Test PDF/PPTX/XLSX output separately from browser rendering. Add route/access tests, publish failure injection, browser regression at desktop/tablet/mobile, keyboard-only editing and preview. Test at 200% zoom and with reduced motion.

Roll out the new author shell behind a founder feature flag. Import local drafts with a preview and explicit destination, retaining the original backup. Keep the old author route available during migration. Roll back the shell independently of existing publications. Do not migrate the renderer and the author UI in the same release.

Success measures: both founders can create, preview and share unassisted; no unexplained loss of edits; stable old client URLs; publish reliability and export success tracked with actual errors; qualitative feedback from several real sales tasks before collaborator work begins.

## Design deliverables and Figma status
Supplied files: [UI](https://www.figma.com/design/Gj30CRCAhwca8oYVfOXQeV/OSIRIS-UI), [Brand book](https://www.figma.com/slides/9GYzO7XXDBoT5hDAAjt7FP), [Logo](https://www.figma.com/design/tGaka8JQGKbav3H4gkiqb0/OSIRIS-Logo).

The connector confirmed the UI page is empty, then reported the Starter-plan MCP quota exhausted. No Figma content was changed. Local HTML/SVG/token deliverables are prepared for review and later import; they are not represented as a completed native Figma prototype.
