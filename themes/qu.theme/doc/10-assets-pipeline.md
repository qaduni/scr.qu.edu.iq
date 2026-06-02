# 10. Assets pipeline

The theme uses Hugo Pipes — Hugo's built-in asset pipeline — to process
CSS, JS, and images at build time. There is **no Node, no Webpack, no
Vite**. This document explains exactly what happens to each kind of
asset.

## CSS

### Source files

All CSS lives in `assets/css/`:

```
assets/css/
├── _variables.css       # design tokens (FIRST in cascade)
├── _fonts.css           # @font-face declarations
├── _base.css            # resets + utility classes
├── _header.css
├── _footer.css
├── _responsive.css      # media queries (LAST in cascade)
└── components/
    ├── _hero.css
    ├── _buttons.css
    ├── ... (one file per UI block)
```

### How it's bundled

`layouts/_default/baseof.html` enumerates them in a deterministic order:

```hugo
{{ $cssFiles := slice
    "css/_variables.css"      ← FIRST: design tokens
    "css/_fonts.css"
    "css/_base.css"
    "css/_header.css"
    "css/components/_hero.css"
    ...
    "css/_footer.css"
    "css/_responsive.css"     ← LAST: media queries
}}

{{ $cssResources := slice }}
{{ range $cssFiles }}
    {{ with resources.Get . }}
        {{ $cssResources = $cssResources | append . }}
    {{ end }}
{{ end }}

{{ $style := $cssResources
    | resources.Concat "css/bundle.css"
    | minify
    | fingerprint }}

<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```

Output: one minified, fingerprinted CSS file at
`/css/bundle.min.<hash>.css`. Browsers can cache it forever.

### Cascade rules

- `_variables.css` **must come first** — everything else references its
  custom properties.
- `_responsive.css` **must come last** — media queries override
  desktop-first component styles.
- Components are independent — order between them doesn't matter, but
  the established order is alphabetical-ish within sections.

### Why we use `resources.Get` with a `with` guard

`resources.Get` returns `nil` for missing files (no error). The `with`
guard quietly skips a missing file rather than failing the build —
useful when a site removes a component override.

### Hot inline `<style>`

`partials/theme-vars.html` emits a tiny `<style>:root{ ... }</style>`
**before** the main bundle, so the brand colour overrides win by cascade
order even though they're inline. This is by design — it means the
build doesn't have to know the brand colour to pre-bake the bundle.

## JavaScript

### Source files

```
assets/js/
├── main.js                # ALWAYS LOADED — header scroll, nav, SW gate
├── home.js                # HOMEPAGE ONLY — visitor counter animation
└── language-redirect.js   # ALWAYS LOADED — first-visit language detection
```

### How it's loaded

`baseof.html` ends with:

```hugo
{{ $jsMain := resources.Get "js/main.js" | minify | fingerprint }}
<script src="{{ $jsMain.RelPermalink }}" defer></script>

<script id="theme-languages" type="application/json">{{ $langs | jsonify | safeJS }}</script>

{{ $jsLang := resources.Get "js/language-redirect.js" | minify | fingerprint }}
<script src="{{ $jsLang.RelPermalink }}"></script>
```

`layouts/index.html` adds the homepage-only script:

```hugo
{{ $jsHome := resources.Get "js/home.js" | minify | fingerprint }}
<script src="{{ $jsHome.RelPermalink }}" defer></script>
```

### Order

1. `main.js` is `defer`-loaded so it runs after parse but before
   `DOMContentLoaded`.
2. The inline `<script id="theme-languages">` is non-defer (parses
   synchronously) so it's available when…
3. `language-redirect.js` runs (also synchronous; can redirect before
   render).
4. `home.js` is `defer`-loaded on the homepage.

### Minify and fingerprint

Each script goes through `minify | fingerprint`. Cache headers can be
set to `immutable` server-side.

## Images

### Where they live

- `assets/images/` — processed by Hugo Pipes when referenced via
  `resources.Get`. The theme ships SVG placeholders here.
- Site-level `assets/images/` — overrides shipped theme images by
  matching path (Hugo's lookup).
- `static/images/` — copied verbatim. Use for assets you don't want
  fingerprinted (e.g. open-graph defaults referenced by external sites).

### Resolution logic

`layouts/partials/site-assets.html` is the canonical resolver:

```hugo
{{- $logoPNG  := resources.Get "images/logo.png"  -}}   ← site or theme
{{- $logoWebP := resources.Get "images/logo.webp" -}}
{{- $logoSVG  := resources.Get "images/logo.svg"  -}}   ← theme fallback only
```

It returns a dict of `{logoPNG, logoPNGAbs, logoWebP, logoWebPAbs, hero}`.
Used via `partialCached` so each resource is published once per build.

### PWA icon resizing

`layouts/index.webmanifest`:

```hugo
{{- $icon := resources.Get "images/logo.png" -}}
{{- with $icon -}}
    {{- $i192 := .Resize "192x192" -}}
    {{- $i512 := .Resize "512x512" -}}
```

Hugo Pipes resizes the source PNG to the two icon sizes Lighthouse
requires. If only an SVG is available, a single `sizes: "any"` SVG icon
is emitted instead.

## Fonts

Fonts live in **`static/fonts/`**, not `assets/fonts/`.

- They're already optimised woff2.
- They don't benefit from fingerprinting (the file name is the version).
- They get copied verbatim to `/fonts/`.

`assets/css/_fonts.css` `@font-face` rules reference them at `/fonts/…`.
`baseof.html` `<link rel="preload">`s the two most-used weights per
language.

## What gets fingerprinted vs verbatim

| Asset                                | Fingerprinted? | Path                           |
| ------------------------------------ | -------------- | ------------------------------ |
| CSS bundle                           | Yes            | `/css/bundle.min.<hash>.css`   |
| `js/main.js`                         | Yes            | `/js/main.min.<hash>.js`       |
| `js/home.js`                         | Yes            | same pattern                   |
| `js/language-redirect.js`            | Yes            | same pattern                   |
| Logos referenced via `resources.Get` | Yes            | content hash in filename       |
| Hero image referenced via `resources.Get` | Yes       | content hash in filename       |
| `static/fonts/*.woff2`               | No             | `/fonts/<name>.woff2`          |
| Anything else in `static/`           | No             | copied verbatim                |

## When to put a file in `assets/` vs `static/`

- **`assets/`** if you want fingerprinting, minification, or resizing.
- **`static/`** if the file is already optimised, must keep a stable URL
  (favicon, fonts, manually managed images referenced by external
  systems), or contains non-text resources Hugo Pipes can't usefully
  process.

## Editing the bundle order

Open `layouts/_default/baseof.html`, edit the `$cssFiles` slice. Adding
a new component file is straightforward:

```hugo
{{ $cssFiles := slice
    ...
    "css/components/_news.css"
    "css/components/_my-new-thing.css"   ← add it here
    ...
}}
```

Place new component files **after** `_base.css` and **before**
`_responsive.css`.
