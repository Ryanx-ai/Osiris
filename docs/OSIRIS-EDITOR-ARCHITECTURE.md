# OSIRIS editor architecture — preparation for 20 November 2026

Planning only, recorded 19 November 2026 (Asia/Singapore). The founder set rebuild work to start tomorrow. The current sales application stays in service. The feature inventory in `devnotes.md` is organised by interface region, not priority.

## One document, two editing surfaces

Use a versioned `DeckDocument` containing slides, stable object IDs, layout constraints, variable definitions, bindings, asset references and gizmo data. Separate document data from ephemeral selection, zoom, active tool, open panels and sidebar width. The canvas and inspector are two views of this document; neither owns a second copy of the content.

Direct editing is fundamental: select an object, edit its text, move/resize it, replace an image or change chart data. Inspector fields dispatch the same commands as canvas interactions. A controlled template starts with defaults; it must not make every change dependent on a form. Preserve the existing client presentation/layout by adapting the object document to the renderer, adding support incrementally and comparing fixtures before rollout.

Suggested object types: Text, Image, Shape, Connector and Gizmo. A Gizmo has a registered type, schema version, data, display settings, accessible alternative and static-export renderer. No arbitrary executable scripts in stored gizmo documents. Pie charts use labelled data rows; branch charts use node/edge IDs and validation appropriate to their type, including cycle rejection for a strict tree.

## Variable resolution and overrides

Bind specific properties to typed variables, rather than replacing substrings in rendered HTML. Define each property as either a literal or a binding with an optional local override. Resolve in this order: explicit local override → valid project variable → template default → visible validation error. Derived fields form a dependency graph; detect cycles and evaluate only affected dependants in topological order. Treat expressions as a small validated grammar, never `eval`.

When editing bound text on a slide, offer “Update variable everywhere” and “Override on this slide”. Show the affected-slide count and preserve the binding metadata when creating an override. Reset-to-variable removes that override. Mixed rich text should use structured runs with bound spans so changing a company name does not unintentionally rewrite unrelated copy.

## Commands, persistence and publication

Use semantic commands such as EditText, MoveObjects, SetVariable, OverrideBinding and SetGizmoData. Group a drag gesture or one completed text edit into an undo transaction. Undo changes document content; it must not reverse authentication, send messages or revoke published URLs. Save revisioned patches with operation IDs and an expected base revision. Acknowledge only the operation the server accepted; late responses must never clear newer changes. On a conflict, preserve local work and offer compare/reapply. Local recovery is not the canonical project database.

Preview and Share compile the same validated document. A publication pins its document, template and asset versions. Repeated attempts use the same idempotency key and snapshot. Published content stays isolated from editor state and credentials. Existing client URLs and the current presentation/proposal experience remain compatible. Interactive charts/forms need explicit static PDF/PPTX representations rather than empty exports.

## Applicable references from the founder's repositories

Reviewed GitHub main snapshots: Tosker `9007afb1aa544eb5963d5b7a2a5b8ee2bba71198`; Luna Vault `afe3150166e600f7ec7eadc25ac705fe9e3a3aa3`. These are design/algorithm references only: no code, dependencies, data or secrets have been copied into OSIRIS.

| Inspected source | Applicable idea | OSIRIS adaptation / boundary |
|---|---|---|
| [Tosker workspace composition](https://github.com/Ryanx-ai/toskerapp/blob/9007afb1aa544eb5963d5b7a2a5b8ee2bba71198/src/lib/workspace-composition.ts) | A normalised state machine controls primary/companion panels and preserves the main canvas | Keep slide selection, zoom and draft state through Chat/Minutes/Inspector changes. Panel visibility never grants data access. No map/location logic is needed. |
| [Tosker sidebar state](https://github.com/Ryanx-ai/toskerapp/blob/9007afb1aa544eb5963d5b7a2a5b8ee2bba71198/src/lib/sidebar-state.ts) | A lightweight local preference with subscription and a server snapshot | Collapse is geometry only. Add storage-unavailable handling and an OSIRIS-specific key; do not use the preference as an access gate. |
| [Tosker draft acknowledgement](https://github.com/Ryanx-ai/toskerapp/blob/9007afb1aa544eb5963d5b7a2a5b8ee2bba71198/src/lib/chat-drafts.ts) | Stable pending IDs prevent a late acknowledgement from clearing newer text; malformed recovery data is rejected | Apply the same receipt-matching principle to saves, AI results and future Chat. Validate bounds and namespace recovery by user and project. |
| [Tosker notification bursts](https://github.com/Ryanx-ai/toskerapp/blob/9007afb1aa544eb5963d5b7a2a5b8ee2bba71198/src/lib/notification-bursts.ts) | Adjacent ordinary messages can be grouped by actor/context/time, while mentions remain distinct | Group already-authorised activity for display only; retain underlying events and read state. Tune the window for sales work. |
| [Luna collection domain](https://github.com/Ryanx-ai/luna-vault/blob/afe3150166e600f7ec7eadc25ac705fe9e3a3aa3/lib/domain/collections.ts) | Working state becomes an explicit immutable snapshot with provenance and change summary | Apply to template releases and published deck versions, with transactional server IDs/revisions. Luna's session-local prototype is not a secure persistence/sharing implementation to copy. Add cycle detection to any brand inheritance. |
| [Luna asset layout](https://github.com/Ryanx-ai/luna-vault/blob/afe3150166e600f7ec7eadc25ac705fe9e3a3aa3/packages/asset-engine/src/calculate-layout.ts) and [export targets](https://github.com/Ryanx-ai/luna-vault/blob/afe3150166e600f7ec7eadc25ac705fe9e3a3aa3/packages/asset-engine/src/export-targets.ts) | Explicit target dimensions, contain-fit and padding produce predictable exports | Validate nonzero finite dimensions, preserve aspect ratio, and use mark-specific optical padding. Never stretch the wordmark into a square favicon. |
| [Luna logo export adapter](https://github.com/Ryanx-ai/luna-vault/blob/afe3150166e600f7ec7eadc25ac705fe9e3a3aa3/lib/export/logo-export-adapter.ts) | Export presets distinguish source availability and output type | Keep export status honest; require the actual vector source. Choose background/clear-space per approved OSIRIS mark rather than copying Luna's generic scale factor or white background. |

Reference platform pattern: [tldraw's editor API](https://tldraw.dev/docs/editor) separates shapes, bindings, tools, selection, camera and history. That supports the separation proposed here; it is not a decision to adopt the SDK. Compare licensing, accessibility, rich-text quality, DOM/SVG export fidelity and maintenance before choosing an editor engine.

## AI Meeting Minutes — public beta contract

Adapt the existing `notesPrompt` → `cleanDraft` → `showDraft` → selective-apply flow in `prototype/src/js/ui.js`. Replace the host-only Claude sample capability with a server provider adapter; keep credentials server-side and the provider replaceable.

Input is pasted notes/transcript first. Recording and transcription are a separate future capability, not implied by the existing feature. Return structured minutes (summary, decisions, action items, open questions) and a separate list of proposed deck patches. Include source snippets/positions where available; missing owners/dates remain blank. Validate schema, lengths, course IDs and allowed patch paths. Review results before applying them; AI never publishes a deck.

Each job carries actor/project IDs, source revision, cancellation state and request ID. Recheck authorisation on submission and result retrieval. If the project changes while AI runs, retain the result for review instead of silently overwriting new content. Group accepted patches as one undo transaction. Notes/minutes are private and excluded from client exports by default. Set request-size/rate limits and timeouts; preserve input on errors and offer manual editing. No provider/account creation is required by this planning document.

## Acceptance checks for the rebuild

- The same edit through canvas and inspector produces the same persisted document and undo result.
- Editing a shared variable updates all bound objects; a local override survives unrelated global updates and resets cleanly.
- Collapsing navigation or changing panels preserves the current slide, draft and selection; keyboard focus remains usable.
- Late saves/AI responses do not discard newer typing; reload restores the last acknowledged revision and offers unsaved recovery.
- Preview, publish and exports use the same pinned document; existing VI client fixtures stay visually equivalent.
- Gizmos have labelled keyboard-accessible interaction and intentional static export fallbacks.
- AI output is reviewable, cancellable, grounded in supplied notes and never automatically shared.
