# 2. Project structure

Top-level layout of the repository:

```
qu.theme/
├── archetypes/                  # Front-matter templates for `hugo new`
│   ├── default.md
│   ├── news.md                  #  → /news/*.md
│   └── announcement.md          #  → /announcements/*.md
│
├── assets/                      # Hugo Pipes-processed assets
│   ├── css/
│   │   ├── _variables.css       # Design tokens (--color-primary, spacing, …)
│   │   ├── _fonts.css           # @font-face for Cairo + Inter
│   │   ├── _base.css            # Resets + utilities
│   │   ├── _header.css
│   │   ├── _footer.css
│   │   ├── _responsive.css      # Loaded LAST so media queries win
│   │   └── components/          # One file per UI component
│   │       ├── _hero.css
│   │       ├── _buttons.css
│   │       ├── _sections.css
│   │       ├── _cards.css
│   │       ├── _quick-links.css
│   │       ├── _news.css
│   │       ├── _announcements.css
│   │       ├── _visitor-counter.css
│   │       ├── _page-header.css
│   │       ├── _lists.css
│   │       ├── _pagination.css
│   │       ├── _content.css
│   │       └── _forms.css
│   ├── images/
│   │   ├── hero.webp            # Default hero background (sites override)
│   │   └── logo.webp            # Default logo (sites override)
│   └── js/
│       ├── main.js              # Header scroll + mobile nav + SW gate
│       ├── home.js              # Visitor counter animation
│       └── language-redirect.js # First-visit language detection
│
├── data/                        # Form taxonomies (sites override)
│   ├── contactForm.yaml         # subject list
│   └── graduateForm.yaml        # graduation years / colleges / employment
│   # Note: the theme does NOT ship data/heroStats.yaml — sites opt into
│   # the hero metrics row by creating their own file. See exampleSite.
│
├── exampleSite/                 # Self-contained demo site
│   ├── hugo.toml                # Full param schema, commented
│   ├── config/_default/         # Demo menus (en + ar)
│   │   └── menus.en.toml
│   ├── data/
│   │   └── heroStats.yaml       # Demo of the optional hero metrics row
│   └── content/                 # Demo content for every section
│       ├── _index.md
│       ├── about/
│       ├── announcements/
│       ├── contact/
│       └── news/
│
├── i18n/                        # Translation bundles
│   ├── en.yaml
│   └── ar.yaml
│
├── images/
│   └── screenshot.svg           # Theme-gallery screenshot
│
├── layouts/                     # Template files (see 09-layouts-and-partials.md)
│   ├── 404.html
│   ├── index.html               # Homepage composition
│   ├── index.webmanifest        # PWA manifest
│   ├── robots.txt
│   ├── _default/
│   │   ├── baseof.html          # Master layout
│   │   ├── list.html            # Chronological article list + Pagefind UI
│   │   ├── section.html         # Section landing (card grid)
│   │   ├── single.html          # Single page / article
│   │   └── redirect.html        # Meta-refresh redirect
│   ├── partials/
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── icons.html           # SVG sprite (all icons)
│   │   ├── lang-switcher.html
│   │   ├── site-assets.html     # Logo / hero resolver (theme→site override)
│   │   ├── theme-vars.html      # :root override from Site.Params.theme.*
│   │   └── sections/            # Homepage section partials
│   │       ├── hero.html
│   │       ├── services.html
│   │       ├── quick-links.html
│   │       ├── news-grid.html
│   │       ├── announcements.html
│   │       ├── contact.html
│   │       └── visitor-counter.html
│   └── shortcodes/
│       ├── contact-form.html    # {{< contact-form >}}
│       ├── graduate-form.html   # {{< graduate-form >}}
│       └── google-map.html      # {{< google-map src="..." height="..." >}}
│
├── static/                      # Copied as-is to /public
│   └── fonts/                   # Self-hosted woff2 (Cairo + Inter)
│       ├── cairo-{regular,medium,semibold,bold}.woff2
│       └── inter-{regular,medium,semibold,bold}.woff2
│
├── LICENSE                      # MIT
├── README.md                    # Short-form user-facing docs
├── theme.toml                   # Hugo theme metadata + min_version
└── doc/                         # THIS FOLDER — long-form documentation
```

## Why this layout?

- **`assets/` vs `static/`**: `assets/` files go through Hugo Pipes
  (concat, minify, fingerprint). `static/` is copied verbatim. Fonts live
  in `static/` because they're already optimised and don't need fingerprinting
  (the URL is stable per file; the browser caches forever).

- **`assets/css/components/*` are partials, not standalone stylesheets**.
  They get glued in a specific order by `layouts/_default/baseof.html` —
  see [`10-assets-pipeline.md`](10-assets-pipeline.md). Editing the order
  there changes the cascade.

- **No "magic" section-specific layouts.** Section pages render through
  `_default/section.html` (card grid) or `_default/list.html` (article
  list) depending on whether the section's `_index.md` sets
  `layout: "list"`. To render a section differently, add a per-section
  template at `layouts/<section>/list.html` or `<section>/section.html`
  — Hugo's lookup order picks it up automatically.

- **`exampleSite/public/` is gitignored** but exists on developers' disks
  after running the dev server. Treat it as build output.

- **`images/screenshot.svg`** is consumed by the Hugo theme gallery and
  shipped as SVG so it stays small and crisp. It is *not* used by any
  layout at runtime.

## How files override each other

Hugo's lookup order means **site files always win over theme files** for
matching paths. The most-used override points:

| Theme file                            | Site override path (the same)              |
| ------------------------------------- | ------------------------------------------ |
| `assets/images/logo.webp`             | Place a higher-res `logo.png` and a 192/512 `logo.webp` in the site's `assets/images/` |
| `assets/images/hero.webp`             | `assets/images/hero.webp`                  |
| `i18n/en.yaml`                        | `i18n/en.yaml` (Hugo merges keys, site wins on conflicts) |
| `data/contactForm.yaml`               | `data/contactForm.yaml`                    |
| `data/graduateForm.yaml`              | `data/graduateForm.yaml`                   |
| Any layout in `layouts/`              | The same relative path in the site         |
| Any partial in `layouts/partials/`    | The same path in the site                  |

`layouts/partials/site-assets.html` is the most-touched override surface:
it returns a dict pointing at logo/hero permalinks, preferring site files
over theme defaults.
