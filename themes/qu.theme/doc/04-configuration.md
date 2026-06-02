# 4. Configuration reference

Everything the theme reads from a downstream site. Use this as a checklist
when bringing up a new deployment.

`exampleSite/hugo.toml` is the **canonical schema** — when in doubt, read
it. This document explains what each section *does*.

## Top-level

```toml
baseURL                 = "https://your-site.example/"
defaultContentLanguage  = "en"
title                   = "Your Organisation"
theme                   = "qu.theme"

[pagination]
  pagerSize = 10
```

- `baseURL` is used for canonical URLs, OG `url`, hreflang `x-default`,
  and JSON-LD `@id`.
- `defaultContentLanguage` controls which language file (`i18n/<lang>.yaml`)
  resolves bare-root URLs and which `<html lang>` value the root sees.
- `[pagination].pagerSize` sets the page size for every list page.

---

## `[languages]`

Each language gets its own block. **The theme reads `direction`** from
this block — it is what flips RTL on/off:

```toml
[languages]
  [languages.en]
    label     = "English"     # used in the language switcher
    weight    = 1             # ordering; first by weight is the "default" for JS lang detection
    direction = "ltr"
    title     = "..."
    locale    = "en"          # ICU date formatting
    [languages.en.params]
      description = "..."
      shortTitle  = "..."
      parentName  = "..."     # shown under logo if set
      parentURL   = "..."
      [languages.en.params.contact]
        address = "..."       # per-language postal address (free text)
```

Then `[languages.ar]` mirrors with `direction = "rtl"`, `locale = "ar"`,
and Arabic strings.

The theme **never hardcodes language codes**. To add a third language,
add `[languages.fr]`, ship `i18n/fr.yaml`, and the language switcher and
RTL toggle pick it up automatically.

---

## `[params]` — site-wide knobs

### Identity

```toml
description = "..."                # site-wide fallback meta description
shortTitle  = "..."                # used in <header> logo block + PWA manifest
parentName  = "Parent Organisation"
officialDomain          = "yoursite.example"
showOfficialDomainNotice = false   # if true, footer shows a domain/email banner
```

### Endpoints — feature gates

These params double as feature flags. Leave blank to **disable** the feature:

```toml
contactFormEndpoint     = ""       # POST URL for {{< contact-form >}}; falls back to mailto if empty
graduateFormEndpoint    = ""       # POST URL for {{< graduate-form >}}; same fallback
visitorCounterEndpoint  = ""       # JSON { today, total, online } endpoint
campusMapEmbed          = ""       # default for {{< google-map >}}
```

### Contact

```toml
[params.contact]
  email   = "info@example.org"
  phone   = "+1 555 0100"
  address = "..."                  # falls back to languages.<lang>.params.contact.address per language
```

`phone` and `email` together drive: the top-bar contact strip, the footer
contact column, the contact CTA section, and the JSON-LD `contactPoint`.

### Social

```toml
[params.social]
  facebook  = "..."
  twitter   = ""                   # empty = link hidden
  youtube   = ""
  instagram = ""
```

Each non-empty entry renders a footer social icon and is added to JSON-LD
`sameAs`.

### Theme colours

```toml
[params.theme]
  primaryColor      = "#0f4c81"    # entire UI re-skins from this
  primaryColorLight = "#1a6bb5"    # gradient endpoint
  primaryColorDark  = "#0a3459"    # hero overlay floor
  accentColor       = "#ffd700"
  backgroundColor   = "#ffffff"    # used in PWA manifest only
  # Optional: override font preload sets per-language
  # preloadFonts.en = ["inter-regular.woff2", "inter-bold.woff2"]
  # preloadFonts.ar = ["cairo-regular.woff2", "cairo-bold.woff2"]
```

The theme emits each hex as a `--color-X` CSS custom property; every
translucent overlay derives its tint from those at render time via
`color-mix()`, so changing `primaryColor` re-tints every glass, shadow,
and hero overlay automatically.

See [`08-styling-and-branding.md`](08-styling-and-branding.md) for the full
list of theme-tunable CSS vars.

### Content section paths

```toml
[params.contentSections]
  news          = "/news"
  announcements = "/announcements"
  contact       = "/contact"
```

These tell the theme where to look for the news section, the
announcements section, and the contact landing page. Override if your
content lives elsewhere — e.g. `/posts` or `/blog`.

### PWA

```toml
[params.pwa]
  enabled = false                  # gate service worker registration on it
```

When `true`, the theme attempts to register `/sw.js`. **The service
worker file is your responsibility** — the theme does not ship one. The
manifest at `/manifest.webmanifest` is always rendered.

### Search (Pagefind)

```toml
[params.search]
  pagefind = false
```

When `true`, every list page embeds the Pagefind component UI (search
input + filter dropdowns + results). You must run `pagefind --site public`
*after* `hugo --minify`. See [`12-search-pagefind.md`](12-search-pagefind.md).

### JSON-LD schema

```toml
[params.schema]
  type          = "EducationalOrganization"   # or "Organization", "GovernmentOrganization", "NGO"
  alternateName = "Example U"
  [params.schema.address]
    locality = "Demo City"
    region   = "Demo State"
    country  = "Example Country"
    street   = ""
    postal   = ""
```

`baseof.html` builds the JSON-LD blob server-side. Only non-empty fields
are emitted. See [`11-pwa-and-seo.md`](11-pwa-and-seo.md).

### External services

```toml
[params.externalServices]
  universityMain = "https://..."
  sustainability = "https://..."
```

Site-defined; the theme exposes these as plain params for sites to
reference from menus or templates.

---

## Output formats

The theme expects three output formats on `home`. The exampleSite uses:

```toml
[outputs]
  home    = ["HTML", "RSS", "sitemap", "WebAppManifest"]
  section = ["HTML", "RSS"]
  page    = ["HTML"]
```

`WebAppManifest` is what makes `layouts/index.webmanifest` render. Drop
it if you don't want a PWA manifest at all.

---

## Markup

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = false
```

The theme assumes `unsafe = false`. If you enable it, audit your content
sources — the theme doesn't sanitise markdown HTML.

---

## Sitemap

```toml
[sitemap]
  changefreq = "weekly"
  filename   = "sitemap.xml"
  priority   = 0.5
```

These flow straight to Hugo's built-in sitemap; the theme does not
customise it.

---

## Param resolution order (when you wonder where a value came from)

The theme reads a string like the homepage description with this chain:

1. Page front matter (`description: "..."`).
2. `Site.Params.description`.
3. The i18n key for that surface (e.g. `i18n "site_description"`).

For colours: a `Site.Params.theme.primaryColor` override emits a `:root`
`<style>` block in the `<head>`, which beats the bundled
`assets/css/_variables.css` default by CSS cascade order.
