# 16. Troubleshooting

Common failure modes and how to fix them. Ordered roughly by "how often
this comes up".

---

## "I see the theme but it's totally unstyled"

**Cause**: the CSS bundle didn't get assembled or didn't load.

**Check**:
- DevTools → Network → look for `bundle.min.<hash>.css`. If 404, the
  fingerprint is stale; `hugo --gc --cleanDestinationDir`.
- View source — `<link rel="stylesheet" href="...">` should exist. If
  missing, you have a custom `baseof.html` that doesn't bundle assets.
- Any console errors about MIME type? You're probably serving from a
  static server that doesn't know `.css`. Use `hugo server` for dev.

---

## "Arabic page renders LTR"

**Cause**: missing `direction = "rtl"` on the language block.

**Fix** in `hugo.toml`:

```toml
[languages.ar]
  direction = "rtl"        # ← this
  locale    = "ar"
  ...
```

The theme reads `.Language.Direction`, not the language code.

---

## "Fonts don't load on Arabic pages"

**Cause**: `static/fonts/cairo-*.woff2` not present, or the site's
`baseof.html` override broke the preload step.

**Check**:
- `ls public/fonts/` after a build — should contain all 8 woff2 files
  (Cairo + Inter, 4 weights each).
- View source on an Arabic page — should have
  `<link rel="preload" href="/fonts/cairo-regular.woff2" ...>`.

---

## "The news / announcements strip is empty"

**Cause**: either the section path is wrong or all pages are `draft: true`.

**Check**:
- `Site.Params.contentSections.news` in `hugo.toml` matches your content
  directory.
- Run `hugo --buildDrafts server` to verify content exists at all.
- Confirm dates are not in the future (default Hugo behaviour hides
  future-dated pages). Use `--buildFuture` if intentional.

---

## "Service worker registration fails / console error"

**Cause**: `Site.Params.pwa.enabled = true` but no `/sw.js` exists.

**Fix**: either ship a real service worker (Workbox, vite-plugin-pwa,
hand-written), or set `pwa.enabled = false`.

The registration error is swallowed silently by `js/main.js`, but you'll
see a Network 404 for `/sw.js` in devtools.

---

## "JSON-LD shows up but is missing fields"

**Cause**: those param paths aren't set in `hugo.toml`.

JSON-LD is emitted with **only the fields you've configured**. Set:

```toml
[params.schema]
  type          = "EducationalOrganization"
  alternateName = "..."
  [params.schema.address]
    locality = "..."
    region   = "..."
    country  = "..."

[params.contact]
  email = "..."
  phone = "..."

[params.social]
  facebook  = "..."
  youtube   = "..."
```

Validate with <https://validator.schema.org/>.

---

## "Pagefind search returns nothing"

**Cause**: you didn't run `pagefind --site public` after `hugo`.

**Fix**:
```sh
hugo --minify
npx pagefind --site public
```

See [`12-search-pagefind.md`](12-search-pagefind.md) for the full
contract. Check `public/pagefind/` exists after the second command.

---

## "Logo / hero image is blurry or wrong"

**Cause**: theme's SVG placeholder is being used because no raster
override exists.

**Fix**: drop a real `logo.png` (≥512×512) and `hero.webp` into the
**site's** `assets/images/`. The theme's `partials/site-assets.html`
will pick them up automatically (site wins over theme).

For full PWA install support, the logo PNG must be ≥512×512 — Hugo
resizes it to 192 and 512 for the manifest.

---

## "Menu changes don't show up"

**Cause**: Hugo cached the parsed config. Restart the dev server:

```sh
# Ctrl-C then
hugo server --themesDir ../..
```

Menu and language changes don't hot-reload. Content + layouts + CSS do.

---

## "Build error: `template was not found: index.html`"

**Cause**: `theme = "..."` in `hugo.toml` doesn't match the theme
directory name. Hugo can't find the layouts.

**Fix**:
- If using `--themesDir ../..` against the qu.theme repo, the parent
  of `qu.theme/` must contain a directory literally named `qu.theme/`
  for the lookup to resolve.
- If using a submodule, the path should be
  `themes/qu.theme/` (matching `theme = "qu.theme"`).

---

## "Build error: `unknown function "merge"` / `dict`"

**Cause**: Hugo too old. The theme requires Hugo ≥ 0.124.0 (extended).

**Fix**: `hugo version` to confirm. Upgrade Hugo.

---

## "Visitor counter shows 0 forever"

**Cause**: either `visitorCounterEndpoint` is not set, or the endpoint
errored, or it returned a shape that doesn't match
`{ today, total, online }`.

**Check**:
- `Site.Params.visitorCounterEndpoint` is a real URL.
- The endpoint returns JSON like `{"today": 5, "total": 1234, "online": 2}`.
- CORS allows the browser to fetch it.
- On error, the section auto-hides (no visible failure).

---

## "Top bar is hidden even though I set a phone number"

**Cause**: actually, it's probably *shown*. The top bar is hidden only
when **both** `top_bar` menu is empty AND `params.contact.email` AND
`params.contact.phone` are empty. Confirm at least one is set.

---

## "I added an entry to `homepage_services` but it doesn't appear"

**Cause**: the menu file is named wrong, or for the wrong language.

**Check**:
- File location: `config/_default/menus.<lang>.toml`, e.g.
  `menus.en.toml` for English.
- The menu identifier is `homepage_services` (note the underscore).
- The site you're viewing matches the menu's language. The English menu
  doesn't render on `/ar/`.

---

## "Pagination buttons are styled weird in RTL"

The custom pagination uses `#icon-chevrons-right` and
`#icon-arrow-right` — visually correct in LTR. In RTL, you may want to
either flip the icons via CSS or swap symbol IDs. The theme doesn't do
this automatically — it's a tradeoff between accessibility (icons
should not flip semantically) and aesthetics (arrows pointing the right
way for the reader).

If you want a flip:

```css
[dir="rtl"] .pagination-link svg {
  transform: scaleX(-1);
}
```

Drop into a site override CSS file.

---

## "How do I debug template values?"

Print them inline:

```hugo
<!-- DEBUG: {{ printf "%#v" .Site.Menus.main }} -->
```

Or with the `jsonify` filter:

```hugo
<!-- DEBUG: {{ .Site.Menus.main | jsonify }} -->
```

Remove before committing.

---

## "Hugo throws weird errors after I pulled latest theme"

Try the full cache clear:

```sh
rm -rf resources/ public/ exampleSite/resources/ exampleSite/public/
hugo --gc --cleanDestinationDir
```

If errors persist, run with `-v` to see template lookup decisions:

```sh
hugo server -v --themesDir ../..
```
