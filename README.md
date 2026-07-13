# Yu Zhan Academic CV

This repository maintains the bilingual academic CV published at [dravencent.github.io](https://dravencent.github.io/). The English site is served from `/`; the Chinese counterpart is served from `/zh/`.

## Public routes

| English | Chinese | Purpose |
| --- | --- | --- |
| `/` | `/zh/` | Research-first homepage |
| `/research/` | `/zh/research/` | Doctoral research directions |
| `/publications/` | `/zh/publications/` | Complete verified publication record |
| `/honors/` | `/zh/honors/` | Verified honors and awards |
| `/cv/` | `/zh/cv/` | Browser-printable academic CV |

Each page declares its exact-language counterpart. The site uses static HTML and CSS only: no analytics, cookies, contact forms, remote fonts, or client-side JavaScript.

## Updating academic content

The canonical content is intentionally small and structured:

- `_data/profile.yml` — identity, biography, education, research directions, links, and skills.
- `_data/publications.yml` — publications in display order, including ordered authors and DOI values.
- `_data/awards.yml` — honors in reverse chronological order.
- `_data/navigation.yml` — the two language-specific menus.

Keep publication author order and DOI spelling exact. English award entries retain the official Chinese title and add only the stored factual descriptor. Add a new award as text; never upload certificates, QR codes, signatures, certificate identifiers, or unrelated team-member personal information.

## Local validation on Windows

The repository includes a project-local D-drive toolchain. Run commands from the checkout root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { . .\scripts\set-local-env.ps1; npm.cmd test; npm.cmd run validate }"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\build-site.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { . .\scripts\set-local-env.ps1; npm.cmd run check:built; git diff --check }"
```

`scripts/build-site.ps1` derives the repository root from its own location and writes the generated site only to `.test-output/site`. Local runtimes, caches, generated output, and worktrees are ignored by Git.

## Deployment

GitHub Pages publishes this user site from the repository root on `master`. Deployment is performed only after local content, build, responsive, print, privacy, and Git review. Never force-push to publish the site.
