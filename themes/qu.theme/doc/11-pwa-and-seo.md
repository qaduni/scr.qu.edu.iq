# 11. PWA and SEO

This document covers everything the theme does for discoverability and
installability: meta tags, Open Graph, Twitter Card, JSON-LD, sitemap,
hreflang, and the PWA manifest.

## Meta tags

`baseof.html` emits, for every page:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="<page description | fallback to site>">
<title>{block "title"}<page title> | <site title>{end}</title>
<meta name="theme-color" content="<primary>">
<link rel="canonical" href="<page permalink>">
```

Page templates can override `title` via the `{{ define "title" }}` block.

## Open Graph + Twitter Card

```html
<meta property="og:title" content="<page title>">
<meta property="og:description" content="<...>">
<meta property="og:type" content="website">
<meta property="og:url" content="<page permalink>">
<meta property="og:site_name" content="<site title>">
<meta property="og:locale" content="<page language>">
<meta property="og:image" content="<absolute URL from front matter image>">
```

Twitter Card defaults to `summary_large_image`. To customise per page,
set `image:` in the page front matter.

## Hreflang

```html
<link rel="alternate" hreflang="en" href="https://...">
<link rel="alternate" hreflang="ar" href="https://.../ar/...">
<link rel="alternate" hreflang="x-default" href="<base URL>">
```

Emitted only when `.IsTranslated`. The `x-default` is unconditional and
points at the site root.

## JSON-LD structured data

Two blobs are emitted server-side:

### 1. Organization-level JSON-LD (every page)

```json
{
  "@context": "https://schema.org",
  "@type":    "EducationalOrganization",       <-- from Site.Params.schema.type
  "name":     "Your University",
  "url":      "https://your-site.example/",
  "logo":     "https://.../logo.png",
  "description": "...",
  "alternateName": "Your U",                   <-- if set
  "address": {                                 <-- if any address field set
    "@type": "PostalAddress",
    "addressLocality": "City",
    "addressRegion":   "State",
    "addressCountry":  "Country",
    "streetAddress":   "...",
    "postalCode":      "..."
  },
  "contactPoint": {                            <-- if phone or email set
    "@type":       "ContactPoint",
    "contactType": "customer service",
    "telephone":   "+1 555 0100",
    "email":       "info@example.org"
  },
  "sameAs": [                                  <-- only non-empty social links
    "https://facebook.com/...",
    "https://youtube.com/..."
  ]
}
```

`@type` defaults to `"Organization"`. Set
`Site.Params.schema.type = "EducationalOrganization"` (or
`"GovernmentOrganization"`, `"NGO"`, …) per your context.

### 2. WebPage JSON-LD (on regular pages only)

```json
{
  "@context": "https://schema.org",
  "@type":    "WebPage",
  "name":     "<page title>",
  "description": "<...>",
  "url":      "<permalink>",
  "inLanguage": "<lang>",
  "isPartOf": { "@type": "WebSite", "name": "...", "url": "..." }
}
```

Only emitted when `.IsPage` (so the homepage and section landing pages
skip it — they're already represented by the Organization blob).

## Sitemap

Hugo's built-in sitemap is used. Configure via `[sitemap]` in
`hugo.toml`. The theme does not generate a sitemap template.

For multilingual sites, Hugo generates one sitemap per language at
`/sitemap.xml` and `/ar/sitemap.xml`, then a sitemap index at the root.

## Robots.txt

`layouts/robots.txt` is shipped as the default; sites can override at
the same path or by disabling and replacing with a `static/robots.txt`.

## PWA manifest

### Render path

`layouts/index.webmanifest` is rendered when `[outputs].home` includes
`WebAppManifest`:

```toml
[outputs]
  home = ["HTML", "RSS", "sitemap", "WebAppManifest"]
```

`baseof.html` links it via:

```html
<link rel="manifest" href="{{ "manifest.webmanifest" | relLangURL }}">
```

`relLangURL` makes the URL `/ar/manifest.webmanifest` for the Arabic
build, so the manifest carries `"lang": "ar", "dir": "rtl"`.

### What the manifest contains

```json
{
  "name":             "<site title>",
  "short_name":       "<params.shortTitle | site title>",
  "lang":             "<lang>",
  "dir":              "<ltr|rtl>",
  "description":      "<params.description>",
  "start_url":        "/",                 // localised
  "scope":            "/",                 // localised
  "background_color": "#ffffff",           // from params.theme.backgroundColor
  "theme_color":      "#0f4c81",           // from params.theme.primaryColor
  "display":          "standalone",
  "icons": [ /* resized from assets/images/logo.png to 192/512 */ ]
}
```

If you want full PWA install support (Lighthouse compliance), ship a
≥512×512 `assets/images/logo.png` in your site repo. Otherwise the
theme falls back to a single `sizes: "any"` SVG icon.

## Service worker

The theme **does not ship a service worker**. The body carries
`data-pwa-enabled="true"` only when `Site.Params.pwa.enabled = true`,
and `js/main.js` then tries to register `/sw.js`. **You are responsible
for providing `/sw.js`** — typically generated by Workbox, vite-plugin-pwa,
or hand-written for static caching.

If `Site.Params.pwa.enabled` is `false` (the default), no SW
registration happens regardless of whether a `/sw.js` exists.

## Accessibility considerations that double as SEO wins

- `<html lang>` and `<html dir>` always set.
- `aria-label` on `<nav>` elements and the main `<a class="logo">`.
- Skip-to-content target (`<main id="main-content">`).
- `loading="lazy"` on all non-hero images.
- `<picture>` + `<source srcset>` for logo / news images (WebP first).
- `fetchpriority="high"` on the hero image preload (homepage only).
- Heading hierarchy preserved (one `<h1>` per page, `<h2>` for sections,
  `<h3>` for cards).

## Where to plug in analytics

The theme deliberately ships no analytics snippet. The cleanest plug-in
point is the `{{ block "scripts" . }}{{ end }}` slot at the bottom of
`baseof.html` — override in a site template or add a partial call.

For privacy-conscious deployments (Plausible, Umami, Fathom), drop the
snippet there. Avoid the `{{ block "head" . }}` slot for analytics
unless you specifically need them to load early.
