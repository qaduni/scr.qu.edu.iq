# 8. Styling and branding

## The big idea

There are **two layers** of styling:

1. **Theme defaults** baked into `assets/css/_variables.css` — every
   colour, spacing token, radius, shadow, font stack.
2. **Site overrides** emitted by `layouts/partials/theme-vars.html` as
   an inline `<style>:root{ … }</style>` block immediately before the
   main CSS bundle. The cascade order means the site overrides win.

If you only need to change colours, **do not touch CSS at all** —
configure `Site.Params.theme.*` in `hugo.toml` and reload.

## Brand-coloured CSS variables

The theme exposes one variable per brand colour as a hex value.
Translucent overlays derive their tint at render time with
`color-mix()`, so overriding `--color-primary` re-tints every glass,
shadow, hero overlay, and hover surface automatically:

```css
--color-primary:        #0f4c81;
--color-primary-light:  #1a6bb5;
--color-primary-dark:   #0a3459;
--color-accent:         #ffd700;

--color-primary-gradient: linear-gradient(135deg,
  var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-primary) 100%);

--hero-overlay-gradient: linear-gradient(
  color-mix(in srgb, var(--color-primary) 85%, transparent),
  color-mix(in srgb, var(--color-primary-dark) 90%, transparent));
```

When you need a translucent variant of a brand colour in your own CSS,
use the same pattern:

```css
background: color-mix(in srgb, var(--color-primary) 10%, transparent);
```

The `color-mix()` syntax is part of CSS Color Module Level 4 and is
supported in every evergreen browser.

**Always provide `primaryColorLight` + `primaryColorDark`** if you
override `primaryColor` — otherwise the gradients keep their default
endpoints (still readable, but no longer harmonised).

## Other useful tokens

```css
/* Typography */
--font-arabic:        'Cairo', 'Segoe UI', Tahoma, sans-serif;
--font-english:       'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-size-base:     16px;
--line-height-base:   1.7;

/* Spacing scale */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
--spacing-3xl: 4rem;
--spacing-4xl: 6rem;

/* Container */
--container-max-width: 1280px;
--container-padding:   1.5rem;

/* Radius */
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:  16px;
--radius-xl:  24px;
--radius-full: 9999px;

/* Shadows */
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
```

Override any of these from your own site stylesheet — they're plain CSS
custom properties.

## How to add your own CSS

You have three options, in order of preference:

### Option A — override CSS variables only

Add `assets/css/site-overrides.css` to your **site repo** with just the
variables you want to change:

```css
:root {
    --color-primary: #b91c1c;
    --container-max-width: 1440px;
}
```

Then hook it into the bundle by overriding `layouts/_default/baseof.html`
in your site (copy the theme's `baseof.html` and add your file to the
`$cssFiles` slice, **after** the variables file).

### Option B — override a single component

Copy any single `assets/css/components/_*.css` into your site at the
same path. Hugo's lookup means your version wins. Useful when, e.g.,
you want a totally different card shape.

### Option C — fork

If you're customising more than 5–10 files, fork the theme and stop
pretending it's a vendored dependency.

## How the CSS bundle is built

`layouts/_default/baseof.html` enumerates a deterministic list of files,
loads each as a Hugo resource, concatenates them in order, minifies, and
fingerprints the result:

```hugo
{{ $cssFiles := slice
    "css/_variables.css"
    "css/_fonts.css"
    "css/_base.css"
    "css/_header.css"
    "css/components/_hero.css"
    "css/components/_buttons.css"
    "css/components/_sections.css"
    "css/components/_cards.css"
    "css/components/_quick-links.css"
    "css/components/_news.css"
    "css/components/_announcements.css"
    "css/components/_visitor-counter.css"
    "css/components/_page-header.css"
    "css/components/_lists.css"
    "css/components/_pagination.css"
    "css/components/_content.css"
    "css/components/_forms.css"
    "css/_footer.css"
    "css/_responsive.css"
}}

{{ $style := $cssResources | resources.Concat "css/bundle.css" | minify | fingerprint }}
```

**`_responsive.css` is intentionally last** so its media queries override
component defaults. **`_variables.css` is intentionally first** so other
files reference variables that already exist.

The fingerprint ensures cache-busting on every change; the URL in
`<link rel="stylesheet">` includes a hash like
`bundle.min.<hash>.css`.

## Glass / blur effect

The theme uses a subtle "glass" treatment for the scrolled header via
`backdrop-filter: blur()` in `_header.css`, plus a translucent tile
background on the optional hero-stats row in `_hero.css`
(`rgba(255, 255, 255, 0.1)` over the brand-coloured hero). Both are
inline values in their component files — there are no dedicated
`--glass-*` custom properties to override. To disable the effect,
override the relevant rule in your site's stylesheet or remove the
`backdrop-filter` declaration in a forked `_header.css`.

## Light / dark

The theme is **light-mode by default** and does not ship a dark variant.
Adding one is a matter of duplicating the `:root` variables into a
`@media (prefers-color-scheme: dark)` block in a site override file —
the brand-tinted overlays inherit automatically.

## Icons

All icons are inline SVG symbols defined in `layouts/partials/icons.html`
and referenced via `<svg><use href="#icon-NAME"></use></svg>`. To add a
new icon:

1. Add a `<symbol id="icon-NAME" viewBox="0 0 24 24" …>` to
   `layouts/partials/icons.html`.
2. Reference it as `icon = "NAME"` (without the `icon-` prefix) in your
   menu entries or directly in a template.

The default viewBox is `0 0 24 24` (Feather/Lucide-compatible). All
shipped icons use `stroke="currentColor"` so they tint with the
parent text colour, except brand glyphs (Facebook, Twitter, YouTube,
Instagram) which use `fill="currentColor"`.
