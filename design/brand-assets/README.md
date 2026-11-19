# OSIRIS digital identity export specification

Status: **planned; source artwork unavailable through the exhausted Figma connector quota**. No new-logo exports have been generated. Existing ring artwork elsewhere in `design/` is provisional and must not be labelled the new logo.

Master: https://www.figma.com/design/tGaka8JQGKbav3H4gkiqb0/OSIRIS-Logo?node-id=0-1

## Foundation frames to prepare in the logo file

Preserve the original master. Add a named Digital foundations section containing Full logo, Logo mark, Wordmark/type, Digital export targets and Usage. Keep editable original type where available; provide outlined SVG delivery copies so rendering does not depend on font installation. Record the actual typeface, weight/custom lettering, colour values, viewBox, bounds, source node IDs and export version. Do not substitute Inter for an unknown wordmark font.

Orange belongs **only inside the approved logo mark**. The application remains black, white and cyan. The wordmark should retain its approved treatment; do not introduce orange typography, orange UI buttons or orange chart palettes as an OSIRIS brand accent. Client-template colours remain independent.

## Export sizes

| Asset | Deliverables | Notes |
|---|---|---|
| Full logo and wordmark | SVG master + outlined SVG; PNG at 160, 240, 320, 480, 640 and 960px widths | Preserve source aspect ratio; transparent light/dark-use versions only as supported by the approved master. Widths are export presets, not claims of a tested minimum. |
| Logo mark | SVG; transparent PNG at 24, 32, 48, 64, 128, 256, 512 and 1024px | Inspect small sizes optically; no stretching or arbitrary redrawing. |
| Browser favicon | SVG, 16/32/48px PNG, multi-resolution ICO containing 16/32/48px | Mark only. Test real 16px rendering on light/dark browser chrome. |
| Apple touch icon | 180×180 PNG | Opaque approved background; account for platform masking. |
| Web application icons | 192×192 and 512×512 PNG; separate maskable 512×512 | Keep critical artwork within the maskable safe zone; do not mark ordinary tightly cropped icons maskable. |
| Social avatar | 400×400 and 1080×1080 PNG | Check square and circular crops. |
| Link preview | 1200×630 PNG | Composed card with full logo/wordmark; do not distort a logo to fill the card. |

The machine-readable `export-plan.json` describes planned assets and Figma destinations. It is not a browser manifest and does not point at nonexistent deployed files. [MDN's manifest icon reference](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons) explains purpose, sizes and maskable use. Final clear space and minimum readable wordmark size must be measured against the actual logo.

## Site integration targets

- `prototype/assets/favicon.svg`: current shared favicon source.
- `prototype/src/index.html`, `prototype/src/login.html`, `prototype/src/js/ui.js`: current favicon embedding paths.
- Login/header logo: use the approved full lockup or mark plus approved wordmark, with an accessible OSIRIS label.
- `design/assets/osiris-mark.svg`, concept and brand-book artwork: refresh only after the new master is inspected.
- Preserve existing immutable published proposals; new exports receive the updated favicon. Do not rewrite client snapshots just to change branding.

Verify SVG safety (no scripts/external references), actual PNG dimensions, ICO entries, transparency/backgrounds, edge clipping, light/dark contrast and 16px legibility. Then build, inspect login/builder/new recipient exports, and deploy the branding change.

## Figma destination checklist

- Logo file: foundation frames, reusable mark/wordmark assets and export settings.
- UI file `Gj30CRCAhwca8oYVfOXQeV`: existing author concept as editable Design content with a vertical-scrolling viewport. Use the new master; the revised feature structure is documented for tomorrow's rebuild.
- Slides file `9GYzO7XXDBoT5hDAAjt7FP`: existing ten-page brand book, updated logo and orange-only-mark rule. Reconcile the navigation page with the revised founder specification.

No native Figma upload or site-logo replacement was completed on 19 November's follow-up because the logo source and file-editing connector remain inaccessible.
