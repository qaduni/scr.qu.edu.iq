# 9. Layouts and partials — file-by-file reference

This is the **map** of every template in `layouts/`. When you're trying
to figure out which file renders a thing, start here.

## Root templates

### `layouts/_default/baseof.html`

The master layout. Everything renders inside its `{{ block "main" . }}`.
Responsibilities:

- `<html lang dir>` from `.Language.Lang` + `.Language.Direction`.
- Document `<title>` block (overridable per template).
- Favicon + apple-touch-icon (resolved via `partials/site-assets.html`).
- PWA manifest link + `theme-color` meta.
- Per-language font preloads.
- Hero image preload when on homepage (`.IsHome`).
- **CSS bundle** assembly (see [`10-assets-pipeline.md`](10-assets-pipeline.md)).
- Inline `<style>:root{ ... }</style>` brand overrides via
  `partials/theme-vars.html`.
- Open Graph + Twitter Card meta.
- Canonical URL.
- Hreflang `<link rel="alternate">` for every translation + `x-default`.
- JSON-LD `Organization` / `EducationalOrganization` blob, fully
  param-driven from `Site.Params.schema`, `Site.Params.contact`,
  `Site.Params.social`.
- JSON-LD `WebPage` blob on `.IsPage`.
- Includes icon sprite, header, main slot, footer.
- Loads `js/main.js` (deferred), then the inline language map + `js/language-redirect.js`.
- Exposes a `{{ block "head" . }}{{ end }}` and `{{ block "scripts" . }}{{ end }}` for per-template extensions.

### `layouts/index.html`

The homepage. **Just composes 7 partials in order**:

```hugo
{{ partial "sections/hero.html" . }}
{{ partial "sections/services.html" . }}
{{ partial "sections/quick-links.html" . }}
{{ partial "sections/news-grid.html" . }}
{{ partial "sections/announcements.html" . }}
{{ partial "sections/contact.html" . }}
{{ with .Site.Params.visitorCounterEndpoint }}
{{ partial "sections/visitor-counter.html" $ }}
{{ end }}
```

Plus loads `js/home.js`. To rearrange the homepage, edit this file.

### `layouts/index.webmanifest`

Renders the PWA manifest at `/manifest.webmanifest` per language
(`/manifest.webmanifest` for default, `/ar/manifest.webmanifest` for ar).
See [`11-pwa-and-seo.md`](11-pwa-and-seo.md).

### `layouts/robots.txt`

A standard robots.txt. Sites override at the same path.

### `layouts/404.html`

A branded 404 page using brand primary colour and the home link.

---

## `_default/` — list / single / section / redirect

### `layouts/_default/single.html`

Renders any single page that doesn't have a section-specific template.

- Page header section with title + breadcrumb (Home → Section → Page).
- **Pagefind metadata**: emits `data-pagefind-body`, `data-pagefind-weight`,
  `data-pagefind-meta="title"` and two `data-pagefind-filter` spans (Type +
  Category) so the search index can filter by news/announcement type.
- Decides Type as `"news"` vs `"announcement"` based on whether the
  page's section path starts with the configured announcements path.

### `layouts/_default/section.html`

The section landing page.

- Renders breadcrumb (Home → Section, skipping Home → Home).
- Renders `.Content` of `_index.md`.
- Renders a `.cards-grid` of child pages with icon (from front matter
  `icon:`), title, description, "Read more" link.

### `layouts/_default/list.html`

The chronological article list used by:

- Any section whose `_index.md` sets `layout: "list"` (this overrides
  `_default/section.html`'s card grid).
- Every taxonomy and term page that doesn't have a custom template.

Renders:

- Page header with breadcrumb (Home → Section).
- Optional Pagefind component UI (input + two filter dropdowns +
  results), gated by `Site.Params.search.pagefind`.
- `_index.md`'s `.Content` (if any) above the list.
- `.Pages.ByDate.Reverse` paginated as `.list-items` with one
  `.list-item` per page: date block (day + month), optional
  category badge (from `Params.type`), optional "Important" badge (from
  `Params.important`), title, summary.
- Custom windowed pagination UI with first/prev/page-numbers/next/last
  buttons.
- The whole page is wrapped in `data-pagefind-ignore="all"` so the list
  itself isn't indexed — only single articles are.

### `layouts/_default/redirect.html`

A `<meta http-equiv="refresh">` page used by stub `_index.md` files in
secondary languages. The redirect target is:

1. The first child page of the current section, if any.
2. The current language's home page.

Useful when a section exists in one language but you want a placeholder
in another that bounces to its home.

---

## `partials/` — top-level

### `partials/header.html`

The site header. Three pieces:

1. **Top bar** (`top_bar` menu + contact strip). Hidden if no menu AND
   no contact params.
2. **Main header**: logo (via `partials/site-assets.html`), site title,
   parentName, `main` menu (with nested dropdowns via `.HasChildren`),
   `aria-current="page"` on the active item.
3. **Language switcher** via `partials/lang-switcher.html`.

### `partials/footer.html`

Four-column footer:

1. **About column**: logo, site description, social icons (only the
   ones with values).
2. **Useful links** (`footer_useful` menu).
3. **Related services** (`footer_services` menu).
4. **Contact info**: address (with per-language fallback to
   `params.contact.address_ar` / `address_en`), phone (always LTR),
   email.

Bottom row: copyright, `footer_bottom` menu, optional official-domain
notice.

### `partials/icons.html`

The SVG sprite. One big inline SVG containing `<symbol>` definitions.
Referenced from layouts as `<svg><use href="#icon-NAME"></use></svg>`.

### `partials/lang-switcher.html`

Reads `hugo.Sites`, lists every language except the current one. Each
link points to:

- The matching translation of the current page, if available.
- Otherwise the target language's home page.

Emits `data-lang-switch="<lang>"` on each link so
`js/language-redirect.js` can persist user choice.

### `partials/site-assets.html`

Returns a dict of resolved asset URLs (`logoPNG`, `logoPNGAbs`,
`logoWebP`, `logoWebPAbs`, `hero`). Looks up in this order:

1. `assets/images/logo.png` / `logo.webp` / `hero.webp` from the **site**.
2. Falls back to `assets/images/logo.webp` / `hero.webp` from the **theme**.
3. Falls back to bundled SVG placeholders if no raster found.

Called via `partialCached "site-assets.html" .` so each resource is
published exactly once per build.

### `partials/theme-vars.html`

Emits an inline `<style>:root{ ... }</style>` block with brand variable
overrides from `Site.Params.theme.*`. Only emits the variables the site
has actually configured. Translucent variants are derived at render
time from these hex values via `color-mix()` — no precomputed RGB
triplets needed (see [`08-styling-and-branding.md`](08-styling-and-branding.md)).

---

## `partials/sections/` — homepage sections

Each of these is **self-suppressing**: if its data source (menu or content
section) is empty, it renders nothing.

### `partials/sections/hero.html`

Hero section with:
- Background image from `partials/site-assets.html` (CSS variable
  `--hero-bg-image`, allowing pure-CSS overlay).
- Accreditation badge.
- `welcome_message` + `site_description` (i18n).
- CTA buttons from the `hero_buttons` menu.
- **Optional metrics row** (`.hero-stats`) driven by
  `data/heroStats.yaml`. Each list entry produces one tile with `value`
  (free-text number) and either `i18nKey` (translation lookup) or
  `label` (static text). The whole row self-suppresses when the data
  file is absent — universities use it, departments and research
  centres typically omit it.

### `partials/sections/services.html`

The 4-card Services grid. Driven by the `homepage_services` menu. Each
card: icon, title, description, "View details →" link.

### `partials/sections/quick-links.html`

A compact icon-grid of links. Driven by the `quick_links` menu.

### `partials/sections/news-grid.html`

The homepage news strip. Reads the configured news section
(`Site.Params.contentSections.news`, default `/news`), takes the
first 3 by date desc, renders each as a card with cover image (or logo
fallback) + date + title + summary. Footer CTA links to the full news
page.

### `partials/sections/announcements.html`

Same shape as news-grid but for announcements. First 4 by date desc.
Each card may surface an "Important" badge, a category badge, and the
`.priority-high` style.

### `partials/sections/contact.html`

A dark CTA panel with two buttons: "Contact" (links to
`Site.Params.contentSections.contact` or `/contact`), and a `tel:` link
if `params.contact.phone` is set.

### `partials/sections/visitor-counter.html`

Three animated counters: today / total / online. Gated by
`Site.Params.visitorCounterEndpoint`. The endpoint must return JSON like
`{ "today": 123, "total": 45678, "online": 5 }`. On any HTTP error the
section hides itself.

---

## `shortcodes/`

### `{{< contact-form >}}`

Renders a contact form. Reads subject options from
`data/contactForm.yaml`. Falls back to a `mailto:` notice if
`Site.Params.contactFormEndpoint` is empty.

### `{{< graduate-form >}}`

A multi-section graduate survey. Reads graduation years, colleges,
employment statuses from `data/graduateForm.yaml`. Same mailto fallback.

### `{{< google-map src="..." height="500" >}}`

Embed a Google Maps iframe. With no `src`, uses
`Site.Params.campusMapEmbed`. Renders nothing when neither is set.
