# maxim-semikov.github.io — portfolio + legal pages

Terminal-themed developer portfolio built with **Astro**, deployed to **GitHub
Pages**. It serves two purposes:

1. **Showcase** — a presentational site (hero, about, skills, projects) with an
   optional interactive console.
2. **Infrastructure** — permanent privacy-policy URLs for each app, required by
   App Store Connect.

## Commands

```sh
npm install      # install deps
npm run dev      # local dev server (http://localhost:4321)
npm run build    # production build → dist/
npm run preview  # serve the built dist/ exactly as GitHub Pages will
```

## Canonical URLs

| Page    | URL |
|---------|-----|
| Home    | `https://maxim-semikov.github.io/` |
| Product | `https://maxim-semikov.github.io/projects/<slug>/` |
| Privacy | `https://maxim-semikov.github.io/projects/<slug>/privacy/` ← in App Store Connect |

## ⚠️ The one rule: never change a published privacy URL

A privacy URL like `…/projects/rental-tracker/privacy/` is hardcoded into the
shipped iOS app and into App Store Connect. Changing it requires an app update.

Each privacy policy is an Astro page that **outputs to that exact directory
URL**:

```
src/pages/projects/<slug>/privacy.astro   →  dist/projects/<slug>/privacy/index.html
                                              (served at /projects/<slug>/privacy/)
```

Because the build uses `format: 'directory'` + `trailingSlash: 'always'`, the
output path is identical to the published URL. Edit the legal text freely, but
**never rename a `<slug>` once its privacy URL is published**, and keep the page
at `projects/<slug>/privacy.astro`.

## Project structure

```
public/
├── .nojekyll
├── favicon.svg
└── scripts/terminal.js          # console + interactivity (vanilla JS)
src/
├── data/                        # ── single source of truth ──
│   ├── skills.ts                #   skills tree + hero tags
│   ├── projects.ts              #   project cards, headers, console VFS
│   └── contacts.ts              #   email / github / telegram
├── components/                  # Topbar, Statusbar, SkillsTree, ProjectCard, Prompt
├── layouts/                     # Terminal (base), Product (app pages), Privacy (legal)
├── styles/terminal.css          # shared theme (Atom One Dark)
└── pages/
    ├── index.astro
    └── projects/<slug>/
        ├── index.astro          # product page
        └── privacy.astro        # privacy policy — locked URL, zero JS
```

## Adding a new project

1. Add an entry to `src/data/projects.ts` (set `appStore` to `live` /
   `coming-soon` / `none`, and `privacy: true|false`).
2. Create `src/pages/projects/<slug>/index.astro` (copy an existing one; it uses
   the `Product` layout and holds the product's prose).
3. If it has a privacy policy, add
   `src/pages/projects/<slug>/privacy.astro` (uses the `Privacy` layout).
4. Use that exact privacy URL in App Store Connect — then never change the slug.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`
(`withastro/action` + `actions/deploy-pages`). In the repo: **Settings → Pages →
Source → GitHub Actions**.
