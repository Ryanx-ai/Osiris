# OSIRIS design review package

- `index.html`: working author UI concept. Open directly, or serve this directory with `python3 -m http.server 3180 --bind 127.0.0.1`.
- `brand-book.html`: ten-page black/white/cyan brand book; each page has a standalone SVG download.
- `workspace-concept.svg`: editable vector author-interface overview with a long canvas. The preserved client cover is an embedded image; author labels, controls and layout are vector/text.
- `brand-book/*.svg`: standalone brand pages for import. The product-visual page embeds the actual concept screenshot.
- `tokens.json`: initial colour, typography, spacing and sizing values.
- `assets/workspace-concept.png`: actual browser visual of the author concept.
- `../docs/OSIRIS-REBUILD-PLAN.md`: research, stack recommendation, phases, migration boundary and acceptance criteria.

## Prototype behaviour
Sidebar navigation, project search, grid/list, template selection, sections navigation, zoom, client-detail focus, preview and share-dialog demonstrations work. Scrolling keeps navigation and the inspector available on desktop. Tablet/mobile rearranges the layout. The Preview button opens the existing client renderer using fictional example data. Forms are preview-only. No real projects or public links are created from this concept. Inspector field edits demonstrate author interaction, but do not regenerate the frozen example client deck.

The next-phase Notifications and Client Chat views explicitly explain that their services are not connected. The current deployed application remains at https://www.osirisdeck.com.

## Figma handoff status
The requested UI file was confirmed empty. Figma then returned a Starter-plan MCP quota error before the logo or brand book could be inspected. No native Figma edits were made. These assets are a local review/handoff package, not a claim that the supplied Figma files are populated.

When connector access returns, use the supplied logo master, recreate the author interface with native auto-layout/components and variables, configure vertical overflow with a viewport frame, and populate the Slides brand book. The SVGs can also be imported for visual reference; SVG import does not recreate prototype interactions or a native component system.

Provisional logo: the current deployed app ring is shown only as an interim reference. The existing Figma logo remains authoritative.

## Brand book map
1. Positioning and signature
2. Purpose and principles
3. Logo stewardship
4. Colour system
5. Typography
6. Interface foundations
7. Real author UI visual
8. Workspace architecture
9. Voice and trust
10. Phased roadmap

Rebuild SVG pages with `python3 design/tools/generate-brand-book.py` from the repository root after updating assets/content. Do not deploy this folder as the production author app.

## Revised founder brief
The 19 November follow-up changes the sidebar and adds direct slide editing, gizmos and AI Meeting Minutes as core requirements. See `../devnotes.md` and `../docs/OSIRIS-EDITOR-ARCHITECTURE.md`. The HTML concept is the earlier visual baseline. Orange is reserved for the new logo mark; the artwork is still awaiting source access. `brand-assets/` contains the export specification, not completed new-logo assets. Rebuild starts 20 November 2026.
