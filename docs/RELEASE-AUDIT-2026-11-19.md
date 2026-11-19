# OSIRIS reliability release — 19 November 2026

Izzat reported that Share link intermittently failed and recovered after refreshing. No matching error was retained in the available production log window, so the original incident's exact cause is unconfirmed.

## Changes
- Share requests obtain a fresh Clerk session token. Up to three attempts recover from expired tokens, network interruptions, rate limits, and server failures. Retries use exactly the same snapshot; atomic create-only storage preserves ownership and existing versions.
- Non-JSON errors and connection timeouts give actionable feedback instead of a JSON parsing error. The publish button is restored after failure. Server errors distinguish authentication from storage.
- Author Preview includes Full screen / Exit full screen, with a full-window fallback. Close and Share restore the editor; Escape and native fullscreen changes update the controls. Fullscreen permission is passed through the iframe chain without granting shared content same-origin access.
- Export CDN requests time out and try their next mirror instead of hanging indefinitely.
- Client Download PDF now selects the PDF export directly instead of opening a menu.
- Google Sheet form submission no longer claims confirmed delivery from an opaque no-cors response; it offers a copy and direct-send alternatives.

## Verification rounds
1. Code and fault tests: founder allowlist; primary-email verification; slug and payload limits; immutable publish ownership; concurrent creation; lost-response idempotency; client token refresh; bounded retries; conflict rejection; non-JSON server failures; assembled scripts parse.
2. Isolated browser flow: preview open/close; full-window fallback and exit; slide navigation; calculator render; required survey fields and preview-only submission; share creation; anonymous client route under production-equivalent sandbox; tour dismissal; enrolment and contact tabs. No messages sent to clients.
3. Export files: PDF header verified; PPTX and XLSX are valid ZIP containers. PDF 568,751 bytes; PPTX 7,786,131 bytes; enrolment workbook 78,943 bytes.
4. Live release: commit `10a566a`, Vercel `dpl_7qbvzPUhzNQYXfAFndmCkqWghU8o` READY. Signed-in founder publish succeeded. Both custom and Vercel domains returned 200 for the shared fixture with sandbox headers; apex redirects preserved its route. Unauthenticated editor access returned 401 and private-builder access 404. The QA fixture was deleted, then both recipient URLs returned 404. Runtime error scan returned no records. Native fullscreen was declined in the controlled browser; the 1440×844 full-window fallback was verified.

## Boundaries
- AI notes depend on a Claude artifact capability and remain hidden on Vercel. A real authenticated AI backend belongs in the next phase; manual notes work today.
- Drafts remain browser-local. JSON backups and transfer preserve portability; shared database projects are next-phase work.
- External mail/WhatsApp apps and Google Sheets delivery depend on the user's setup. No real messages or real survey responses were submitted during QA.
- Checks cover the exercised paths, not every browser/device or every possible combination of funding inputs. Funding policy accuracy was not re-certified in this software release.
