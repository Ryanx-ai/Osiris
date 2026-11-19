# Public recipient pages

This folder is the manual bridge from the prototype's HTML export to hosted client URLs. It preserves the existing app and does not add a database or publish API.

1. In the builder, create/preview a deck and use the existing HTML / Google Sites export to download the full recipient microsite (or deck-only HTML).
2. Review the export and confirm all included content is suitable for the public repository and public website. Do not publish draft JSON, private seeds or confidential client material here.
3. Save the self-contained HTML as `published/<organisation>/<project-name>/index.html`. Use lowercase letters, digits and single separating hyphens in each slug.
4. Run `npm test` and `npm run build:public` from `prototype/`; preview the generated page under `dist/`.
5. Commit the reviewed export and push to `main`. Vercel builds the same two-segment URL on both production hostnames.

Example destination:

```text
prototype/published/vertical-institute/project-name/index.html
```

Example URL after publishing a project (domain is connected):

```text
https://osirisdeck.com/vertical-institute/project-name
```

The same path works on the production `vercel.app` alias. There are no actual client publications in this initial import. A path becomes available only after its HTML exists and is deployed; unknown paths return 404. No wildcard route returns the editor. Self-contained HTML preserves interactive controls and the existing PDF export.

Remove the source HTML and redeploy to withdraw a path from the current production alias. This does not erase Git history, old deployment URLs or downloaded copies. Authenticated storage, revocation and private publishing belong to the next phase.
