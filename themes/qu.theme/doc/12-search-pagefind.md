# 12. Search — Pagefind integration

The theme integrates with [Pagefind](https://pagefind.app/) — a static
search index that runs entirely client-side. Pagefind is **optional**;
the theme works perfectly without it, just without a search box.

## How the integration works

There are three pieces:

1. **Indexing-time markup** on single-article pages
   (`layouts/_default/single.html`).
2. **Component UI** on every list page (`layouts/_default/list.html`),
   gated by `Site.Params.search.pagefind`. Any section that uses
   `layout: "list"` automatically gets the search bar.
3. **Index generation step** — run `pagefind` *after* `hugo` builds
   the site. This is the only step that requires Node.

## Step 1 — Indexing markup

`layouts/_default/single.html` emits Pagefind data attributes:

```html
<h1 data-pagefind-body data-pagefind-weight="10" data-pagefind-meta="title">
  {{ .Title }}
</h1>
...
<article class="article-content" data-pagefind-body>
  <span hidden data-pagefind-filter="Type:News"></span>
  <span hidden data-pagefind-filter="Category:Academic"></span>
  ...
</article>
```

`data-pagefind-body` tells Pagefind "index this region". The `<h1>`
extra attributes give it a higher relevance weight and a structured
"title" meta field.

The list page wrapper has `data-pagefind-ignore="all"` so the index
contains **only single articles**, not the list view itself.

### Filter keys are language-neutral

The Type / Category filter keys are read from the **i18n bundle**:

```hugo
{{ $pfTypeKey := i18n "type_label" }}
{{ $pfCategoryKey := i18n "category_label" }}
```

So `i18n/en.yaml` has `type_label: "Type"` and the English build's
filter is keyed by `"Type"`; the Arabic build's filter is keyed by
`"النوع"`. This means **each language has its own filter set**, which
is what you want for a localised search UX.

The filter *values* are similarly localised — `i18n "news_label"`,
`i18n "announcement_label"`, and the `category_<name>` keys.

## Step 2 — Component UI

The Pagefind Component UI is embedded on every list page:

```hugo
{{ if .Site.Params.search.pagefind }}
<div id="search-container" class="search-box-full">
  <pagefind-config></pagefind-config>
  <pagefind-input placeholder="{{ i18n "search_placeholder" }}"></pagefind-input>
  <pagefind-filter-dropdown filter="{{ $pfTypeKey }}" label="{{ $pfTypeKey }}"></pagefind-filter-dropdown>
  <pagefind-filter-dropdown filter="{{ $pfCategoryKey }}" label="{{ $pfCategoryKey }}"></pagefind-filter-dropdown>
  <pagefind-results></pagefind-results>
</div>
{{ end }}
```

And at the bottom of the same page:

```html
<link href="/pagefind/pagefind-component-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-component-ui.js" type="module"></script>
```

These files come from the Pagefind build step (step 3).

## Step 3 — Build the index

```sh
hugo --minify
npx pagefind --site public
```

This generates a `public/pagefind/` directory containing:

- `pagefind-component-ui.css` / `pagefind-component-ui.js`
- `pagefind.js` (the core search runtime)
- `pagefind.<hash>.pf_index` and friends — the actual index data

Deploy `public/` as usual.

## Enabling it on a new site

```toml
# hugo.toml
[params.search]
  pagefind = true
```

Then re-run `hugo --minify && npx pagefind --site public`. If you have
CI/CD, add the pagefind step after the Hugo build.

## Disabling it

Set `Site.Params.search.pagefind = false` (the default). The
indexing-time `data-pagefind-*` attributes remain in the HTML (harmless;
ignored without the Pagefind runtime), and the component UI is not
embedded.

## Common issues

### "Search returns no results"

- Did you run `pagefind --site public` after `hugo`?
- Check that `public/pagefind/pagefind.js` exists.
- Open browser devtools — the component should load `pagefind.js` from
  `/pagefind/`. A 404 there means the index isn't deployed.

### "Filter dropdowns are empty"

- The filter keys in the dropdown markup must match the filter keys
  emitted by `single.html`. Both come from the same i18n keys
  (`type_label`, `category_label`), so this only breaks if you've
  overridden one bundle and not the other.

### "Per-language search isn't isolated"

- Pagefind auto-detects language from `<html lang>` and shards by it.
  Each language build produces its own search records under `public/<lang>/`
  via `pagefind --site public` — by default, Pagefind treats the whole
  `public/` as one site. To get language-aware sharding, build each
  language separately or use `pagefind --site public --root-selector main`
  with care.

### "I want search on the homepage, not just the list pages"

- Move or duplicate the `<pagefind-input>` markup into another partial.
  The component UI is self-contained — wherever the custom elements
  exist, they work.
