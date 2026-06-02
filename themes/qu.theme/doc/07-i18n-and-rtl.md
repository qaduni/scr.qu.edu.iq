# 7. i18n and RTL

The theme is **multilingual by design**. It ships English and Arabic
translation bundles, two self-hosted fonts (Inter for Latin, Cairo for
Arabic), and uses **CSS logical properties** so the same stylesheet
works in both reading directions.

## How direction is selected

`layouts/_default/baseof.html` line 3:

```html
<html lang="{{ .Language.Lang }}" dir="{{ .Language.Direction | default "ltr" }}">
```

`.Language.Direction` is read from `hugo.toml`:

```toml
[languages]
  [languages.en]
    direction = "ltr"
  [languages.ar]
    direction = "rtl"
  [languages.he]                  # Hebrew? Same recipe.
    direction = "rtl"
  [languages.fa]                  # Persian? Same recipe.
    direction = "rtl"
```

**The theme never inspects the language code itself** to decide RTL. So
Arabic, Hebrew, Urdu, Persian, Pashto, … all "just work" by setting
`direction = "rtl"`.

## How CSS handles direction

The CSS uses **logical properties** everywhere flow-relative spacing is
needed:

```css
margin-inline-start: 1rem;    /* not margin-left */
padding-inline:      1rem;    /* not padding-left + padding-right */
border-inline-end:   1px solid #ccc;
```

These map to physical sides based on the `<html dir>` attribute. The
result: one stylesheet handles both LTR and RTL with no `[dir="rtl"]`
overrides needed.

Exceptions where physical sides *are* used: contact info phone numbers
get an inline `style="direction: ltr"` (so `+964 …` doesn't flip in RTL
context).

## How fonts handle direction

Two font families ship in `static/fonts/`:

- **Inter** (Latin) — used when the page lang is `en` (or anything not Arabic).
- **Cairo** (Arabic) — used when the page lang is `ar`.

`assets/css/_variables.css` exposes:

```css
--font-arabic:  'Cairo', 'Segoe UI', Tahoma, sans-serif;
--font-english: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

`assets/css/_fonts.css` and `_base.css` switch between them via
`[data-lang]` on `<body>`. To swap fonts wholesale, override these CSS
variables from your site's stylesheet — no need to fork the theme.

### Font preloads

`baseof.html` preloads two woff2 files for the current language to
eliminate FOUT on first paint. The default map:

```hugo
{{ $defaultFonts := dict
    "ar" (slice "cairo-regular.woff2" "cairo-bold.woff2")
    "en" (slice "inter-regular.woff2" "inter-bold.woff2")
}}
```

Override per-language in `hugo.toml`:

```toml
[params.theme]
  [params.theme.preloadFonts]
    en = ["my-sans-regular.woff2", "my-sans-bold.woff2"]
    fr = ["my-sans-regular.woff2"]
```

Then drop matching woff2 files into your site's `static/fonts/`.

## How i18n bundles work

Hugo merges site `i18n/<lang>.yaml` over theme `i18n/<lang>.yaml`. To
override a single string, define just that key in your site bundle:

```yaml
# YOUR-SITE/i18n/en.yaml
welcome_message: "Welcome to the Department of Computer Science"
```

The other ~120 keys stay at theme defaults.

## Adding a new language

1. **Add the language block** to `hugo.toml`:
   ```toml
   [languages.fr]
     label     = "Français"
     weight    = 3
     direction = "ltr"
     locale    = "fr"
     title     = "Mon Université"
     [languages.fr.params]
       description = "..."
   ```

2. **Ship a translation bundle** at `i18n/fr.yaml`. Copy
   `themes/qu.theme/i18n/en.yaml` as a starting point and translate
   each value.

3. **(Optional)** **Add language-specific content** at `content/page.fr.md`
   or content directories per Hugo conventions.

4. **(Optional)** **Add a French menu** at
   `config/_default/menus.fr.toml`.

No template changes required. The language switcher partial discovers
the new language via `range hugo.Sites`, and the JS first-visit
redirect picks it up from the inline JSON blob server-rendered into
`baseof.html`:

```html
<script id="theme-languages" type="application/json">
  [{"lang":"en","url":"/","default":true},
   {"lang":"ar","url":"/ar/","default":false},
   {"lang":"fr","url":"/fr/","default":false}]
</script>
```

## Date formatting

The theme uses ICU-style date tokens via Hugo's `time.Format`:

```hugo
{{ .Date | time.Format ":date_long" }}
```

`:date_long`, `:date_medium`, `:date_full` honour the per-language
`locale` setting in `hugo.toml` — so an Arabic page sees Arabic month
names, an English page sees English month names. No template branching.

## Pagefind in multilingual mode

The theme uses **language-neutral filter keys** (English) but
**localised display labels** so filters survive across languages. See
[`12-search-pagefind.md`](12-search-pagefind.md) for details.

## RTL pitfalls and how the theme avoids them

| Pitfall                                                  | Mitigation                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Phone numbers flipping in RTL                            | Inline `style="direction: ltr;"` on `<span>` containers in header/footer.  |
| Icons + text rendering "icon after text" in LTR          | Use the same icon SVG; flex layout + logical properties handle the swap.   |
| Arrow icons pointing wrong way in RTL                    | The hero CTA secondary button uses `#icon-arrow-right` — visually correct in LTR; some sites flip via `transform: scaleX(-1)` per language. (Not done in-theme; add to your site CSS if needed.) |
| Hardcoded `<link rel="alternate" hreflang="...">` order  | The theme uses `range .Translations` so order tracks Hugo's site order.   |
| `lang` attribute missing on `<html>`                     | Always emitted from `.Language.Lang`.                                      |
| Cairo woff2 not loading                                  | Preloaded explicitly in `baseof.html` per language.                        |
