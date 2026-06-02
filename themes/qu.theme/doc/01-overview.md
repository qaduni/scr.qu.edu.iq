# 1. Overview — what this theme is and how it thinks

## What it is

`qu.theme` is a Hugo theme designed for the kind of website a university,
faculty, department, research centre, or public-sector unit needs: a clear
homepage with services and quick links, a news + announcements feed, an
about/contact area, multilingual (especially Arabic + English), and the
usual SEO / PWA / accessibility table-stakes.

It was originally built for **Al-Qadisiyah University** (`qu.edu.iq`) but
ships generic — every label, colour, menu, schema type and content path is
configurable so it isn't married to one institution.

## The mental model: **config-first, code-second**

Most Hugo themes ask you to fork them to change anything substantial. This
theme tries hard not to. The shape of the site comes from three sources, in
this order of preference:

1. **`hugo.toml` params** — colours, schema type, social links, contact info,
   feature flags, content section paths.
2. **`Site.Menus` entries** — every navigation surface (header, footer,
   homepage Services cards, homepage Quick Links, hero CTA buttons, top
   bar) reads from a named menu.
3. **i18n bundles** — every visible string resolves through `i18n "key"`,
   so language additions never need template edits.

The layouts themselves rarely change between adopting sites. If you find
yourself editing `layouts/partials/header.html` to add a link, you're
doing it wrong — add a menu entry instead.

## What the homepage is composed of

`layouts/index.html` is a 7-line file that just composes partials:

```
hero  →  services  →  quick-links  →  news-grid  →  announcements  →  contact  →  visitor-counter
```

Each section partial reads its content from a named menu or content path
and **renders nothing if its data source is empty**. So a site with no
`homepage_services` menu has no Services section — there's nothing to
disable. This is how the theme stays useful for both a 5-page department
microsite and a 200-page faculty hub.

## What the inner pages are

- `layouts/_default/single.html` — single news / announcement / generic page
- `layouts/_default/section.html` — section landing (e.g. `/about/`) —
  renders subpages as a card grid with icons
- `layouts/_default/list.html` — chronological article list with
  breadcrumb, optional [Pagefind](https://pagefind.app/) search bar, and
  windowed pagination. Used by any section whose `_index.md` sets
  `layout: "list"` (or any taxonomy/term page)
- `layouts/_default/redirect.html` — meta-refresh redirect used by empty
  language stubs
- `layouts/404.html` — branded 404
- `layouts/index.webmanifest` — PWA manifest, rendered as JSON
- `layouts/robots.txt` — robots.txt

## Two section styles: card grid vs article list

Hugo lookup picks `_default/section.html` for section pages by default,
so a brand-new section like `/about/` renders as a card grid. To make a
section render as a chronological article list instead (the typical news
shape), set `layout: "list"` in its `_index.md`:

```yaml
---
title: "News"
layout: "list"
---
```

The example site's `/news/` does this. `/about/` and `/contact/` don't —
they keep the card grid.

## What's special about news + announcements

The theme treats two content sections specially **on the homepage**:

- **News** (default `/news`, override via `Site.Params.contentSections.news`)
- **Announcements** (default `/announcements`, override via
  `Site.Params.contentSections.announcements`)

The homepage shows the latest 3 news cards and the latest 4 announcement
cards. Beyond the homepage the two sections each render independently
through the standard list template — there is no special union template.
Announcements can be flagged `important: true` to surface with the
accent colour.

## What's *not* in this theme

This is a *generic* theme — these things are intentionally absent:

- **No CMS adapters.** It's a static Hugo theme; bring your own CMS if
  you need one (Decap, Tina, Forestry, …).
- **No JS framework.** ~3 small vanilla-JS files; no React, Vue, Alpine.
- **No CSS preprocessor.** Plain CSS with custom properties. Hugo Pipes
  concatenates and minifies — no Sass, no PostCSS, no Tailwind.
- **No npm dependency required to build the site.** Pagefind is optional
  and only needed if you turn search on.
- **No bundled analytics.** Add your own snippet via a `head` override
  or a partial — the theme is silent by default.

## Versioning and Hugo compatibility

- **Hugo ≥ 0.124.0** required (uses per-language `locale` for ICU date
  formatting, `merge`, `dict`, `cond`, `safeJS` template features).
- Theme version is currently tagged via git; there is no `package.json`
  or `theme version` directive beyond `theme.toml`'s `min_version`.
