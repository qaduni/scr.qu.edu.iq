# 14. Development workflow

How to work on the theme effectively — whether you're polishing a
single component or making a substantial change.

## Repository layout for development

There is only **one canonical layout** for working on the theme: edit
files directly in the theme repo, and run the exampleSite against it.

```sh
cd qu.theme/exampleSite
hugo server --themesDir ../..
```

The `--themesDir ../..` flag tells Hugo to look for themes one directory
above `exampleSite/`. From there, `theme = "qu.theme"` in
`exampleSite/hugo.toml` resolves to the parent repo.

**Result**: changes to layouts, CSS, JS, i18n, data, archetypes, and
images all hot-reload in <1s.

## What hot-reloads, and what doesn't

| Change                                            | Hot-reloads? |
| ------------------------------------------------- | ------------ |
| `layouts/**/*.html`                               | Yes          |
| `assets/css/**/*.css`                             | Yes          |
| `assets/js/**/*.js`                               | Yes          |
| `i18n/*.yaml`                                     | Yes          |
| `data/*.yaml`                                     | Yes          |
| `content/**/*.md` (in exampleSite)                | Yes          |
| `static/**` (new files)                           | Yes (copy)   |
| `archetypes/*.md`                                 | No (used at `hugo new` time only) |
| `theme.toml`                                      | No — restart Hugo |
| `exampleSite/hugo.toml` `[params]`                | Yes          |
| `exampleSite/hugo.toml` `[outputs]` / `[languages]` | No — restart Hugo |
| New file under `static/fonts/`                    | Yes (copy)   |

## Tools that help

- **Hugo's verbose mode**: `hugo server -v` surfaces template lookup
  decisions and resource processing logs.
- **Hugo's template metrics**: `hugo --templateMetrics` prints
  per-template render time + cache hit rate. Useful when adding new
  partials.
- **Manual cache-busting**: `hugo --gc --cleanDestinationDir` if you
  suspect stale fingerprinted assets.

## Smoke-testing checklist before a commit

1. `cd exampleSite && hugo server --themesDir ../..` starts cleanly,
   no template errors.
2. Homepage shows hero, services, quick-links, news strip, announcements
   strip, contact CTA.
3. `/about/`, `/news/`, `/announcements/`, `/contact/` all render.
4. Switching to `/ar/` flips direction to RTL and Cairo font loads.
5. Mobile width (<768px) collapses nav to hamburger and dropdowns work
   on tap.
6. A page with `important: true` (e.g. `announcements/launch.md`) shows
   the priority badge and accent styling.
7. View source on any single page — JSON-LD Organization blob is
   present and valid (paste into <https://validator.schema.org/>).
8. `hugo --minify --themesDir ../..` completes without warnings.
9. Build size hasn't regressed dramatically (eyeball `du -sh public/`).

## File-touching heuristics

When making a change, edit the **most specific** file that solves it:

- Wrong colour somewhere? → `Site.Params.theme.*` or a single component
  CSS file. Never `_variables.css`.
- Wrong copy somewhere? → `i18n/<lang>.yaml`. Never inline in a template.
- Wrong link in the header? → `config/_default/menus.<lang>.toml`. Never
  `header.html`.
- Wrong layout on a section? → Edit the relevant `_default/*.html`
  (`section.html` for the card grid, `list.html` for the article list).
  For section-specific tweaks, add `layouts/<section>/list.html` and
  Hugo will prefer it over the default.

## Adding a new component CSS file

1. Create `assets/css/components/_mything.css`.
2. Open `layouts/_default/baseof.html`.
3. Add `"css/components/_mything.css"` to the `$cssFiles` slice between
   `_base.css` and `_responsive.css`.
4. Use CSS custom properties from `_variables.css` instead of hex codes
   — this is what keeps the theme re-skinnable.

## Adding a new partial

1. Create `layouts/partials/sections/mything.html`.
2. Decide its data source: a menu identifier (preferred) or a content
   section path.
3. **Self-suppress** if the data source is empty — the partial should
   render nothing rather than an empty container.
4. Add `{{ partial "sections/mything.html" . }}` to `layouts/index.html`
   (or wherever appropriate).
5. Add an i18n key for the section heading. Translate every shipped
   language (en + ar at minimum).

## Adding a new shortcode

1. Create `layouts/shortcodes/myshortcode.html`.
2. Document calling syntax in a leading `{{- /* … */ -}}` comment block.
3. Add a fallback path for any required external config (endpoint,
   embed URL, …).

## Linting

The theme has no linter wired in. Recommended manual passes:

- **HTML**: paste output through <https://validator.w3.org/>.
- **CSS**: there's nothing to lint against; just run the dev server.
- **Templates**: `hugo --templateMetrics` will surface unused partials
  (`hit% = 0`).
- **JSON-LD**: <https://validator.schema.org/>.
- **Lighthouse**: run against a deployed exampleSite for the holistic
  accessibility / SEO / PWA score.

## Git hygiene

- Commit `exampleSite/hugo.toml`, `exampleSite/config/`, and
  `exampleSite/content/` changes when they demonstrate a feature.
- **Never** commit `exampleSite/public/` or `exampleSite/resources/` —
  both are gitignored.
- The `Init` commit is the baseline; subsequent commits should follow
  the existing `(fix):` / `(feat):` prefix style.

## Updating the theme in downstream sites

- Submodule sites: `git submodule update --remote themes/qu.theme`.
- Module sites: `hugo mod get -u github.com/qaduni/qu.theme`.
- Vendored sites: manually rsync from the upstream repo.

After updating, rebuild and visually scan the homepage + a single
article + the news list to catch any regressions before publishing.
