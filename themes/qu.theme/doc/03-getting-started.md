# 3. Getting started

This document covers running the theme locally — both **as a contributor**
to the theme itself and **as a consumer** in a downstream site.

## Prerequisites

- **Hugo (extended) ≥ 0.124.0**
  - `hugo version` should report a version with the `extended` tag.
  - On Arch / CachyOS: `pacman -S hugo`.
  - On macOS: `brew install hugo`.
  - Anywhere else: download from <https://github.com/gohugoio/hugo/releases>.
- **Git**, for the submodule installation path and for normal development.
- *(Optional)* **Pagefind** (`npm i -g pagefind` or `npx pagefind`) if you
  want full-text search.

No Node, no npm, no Sass — Hugo does the work.

---

## A — Running the theme's own `exampleSite/`

This is the right starting point if you're contributing to the theme or
just want to see every feature wired up.

```sh
cd exampleSite
hugo server --themesDir ../..
```

- `--themesDir ../..` points Hugo at the parent of the theme directory.
- The dev server boots on <http://localhost:1313/>.
- Edits to layouts, CSS, JS, and content all hot-reload.

Stop with Ctrl-C. Build a one-shot production bundle with:

```sh
cd exampleSite
hugo --minify --themesDir ../..
```

Output goes to `exampleSite/public/`, which is gitignored.

---

## B — Adopting the theme in a new site

### Option 1: Git submodule (simplest)

```sh
hugo new site mysite
cd mysite
git init
git submodule add https://github.com/qaduni/qu.theme themes/qu.theme
echo 'theme = "qu.theme"' >> hugo.toml
```

Then copy the starter config from `exampleSite/hugo.toml` (the file is
heavily commented; treat it as a schema) and tailor params.

### Option 2: Hugo Module

```sh
hugo new site mysite
cd mysite
hugo mod init github.com/you/mysite
```

In `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/qaduni/qu.theme"
```

Then `hugo mod get -u`.

### Option 3: vendored copy

Just copy this repo's contents into `themes/qu.theme/` of your site. You
lose update tracking but gain full control.

---

## Smoke-testing a new site

After adopting the theme:

```sh
hugo new news/hello-world.md      # uses archetypes/news.md
hugo new announcements/launch.md  # uses archetypes/announcement.md
hugo server
```

You should see:

- The hero with placeholder copy from `i18n/en.yaml`.
- The "Services" + "Quick Links" sections **hidden** until you define
  `homepage_services` / `quick_links` menus (see
  [`05-menus-and-navigation.md`](05-menus-and-navigation.md)).
- A 1-card news strip and a 1-card announcements strip after publishing
  the two pages above (remove `draft: true` first).
- The contact CTA section.

If you see all of the above, the theme is working. Configure params from
there.

---

## Common first-run errors

| Symptom                                              | Likely cause                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `template was not found`                             | Theme directory name doesn't match `theme = "..."` in `hugo.toml`.          |
| `error calling resources.Get: ...`                   | An asset path in `baseof.html`'s `$cssFiles` list points at a missing file. |
| No CSS at all                                        | A site override of `layouts/_default/baseof.html` is missing the bundle step. |
| Fonts not loading                                    | `static/fonts/` was not copied to `public/` — verify by checking `public/fonts/`. |
| Arabic page renders LTR                              | `direction = "rtl"` missing on the `[languages.ar]` block.                  |
| `unknown function "merge"`                           | Hugo too old — upgrade to ≥ 0.124.0.                                        |

---

## Hot-reload caveats

- Editing `theme.toml` requires a full server restart.
- Editing `hugo.toml` usually hot-reloads, but param-driven *CSS variables*
  (via `layouts/partials/theme-vars.html`) may need a hard refresh
  because the inline `<style>` is cached aggressively.
- Editing `i18n/*.yaml` hot-reloads.
- Editing files in `static/` triggers a copy, not a rebuild — no need to
  restart.
