# qu.theme — Developer Documentation

A bilingual (RTL/LTR), menu-driven Hugo theme built for universities, faculties,
research centres and similar public-sector organisations. This documentation
explains how the theme is wired internally and how to work on it effectively —
whether you're consuming it as a downstream user, modifying its layouts, or
extending it with new sections.

> Looking for the short pitch? Read `../README.md`. This folder is the
> long-form companion for contributors.

## How to read these docs

The documents are ordered from "what is this and how do I run it" to
"how do I change deep internals". Skim them in order on a first read.

| # | Document                                          | Read when…                                                |
| - | ------------------------------------------------- | --------------------------------------------------------- |
| 1 | [`01-overview.md`](01-overview.md)                | You want a 3-minute mental model of the theme             |
| 2 | [`02-project-structure.md`](02-project-structure.md) | You're navigating the repo for the first time           |
| 3 | [`03-getting-started.md`](03-getting-started.md)  | You want to run / preview the theme locally               |
| 4 | [`04-configuration.md`](04-configuration.md)      | You're tuning `hugo.toml` params for a downstream site    |
| 5 | [`05-menus-and-navigation.md`](05-menus-and-navigation.md) | You need to reshape header / footer / homepage IA |
| 6 | [`06-content-model.md`](06-content-model.md)      | You're authoring news, announcements, or pages            |
| 7 | [`07-i18n-and-rtl.md`](07-i18n-and-rtl.md)        | You're adding a language or reviewing RTL behaviour       |
| 8 | [`08-styling-and-branding.md`](08-styling-and-branding.md) | You're re-skinning colours, fonts, or component CSS |
| 9 | [`09-layouts-and-partials.md`](09-layouts-and-partials.md) | You're editing templates and want to know what each one does |
| 10 | [`10-assets-pipeline.md`](10-assets-pipeline.md) | You're touching CSS / JS / images / Hugo Pipes            |
| 11 | [`11-pwa-and-seo.md`](11-pwa-and-seo.md)        | You're working on the manifest, JSON-LD, OG, hreflang     |
| 12 | [`12-search-pagefind.md`](12-search-pagefind.md) | You're enabling or debugging the Pagefind UI              |
| 13 | [`13-forms-and-data.md`](13-forms-and-data.md)  | You're adjusting the contact / graduate-survey forms      |
| 14 | [`14-development-workflow.md`](14-development-workflow.md) | You're contributing changes back to the theme    |
| 15 | [`15-extending-the-theme.md`](15-extending-the-theme.md) | You want to add a new section, partial, or shortcode |
| 16 | [`16-troubleshooting.md`](16-troubleshooting.md) | Something is broken and you want common fixes             |

## TL;DR for first-time contributors

1. The theme **renders entirely from `hugo.toml` params + `Site.Menus`** —
   most "customisation" is config, not code.
2. **No build step.** CSS and JS are processed through Hugo Pipes
   (`resources.Concat | minify | fingerprint`) at build time.
3. **Everything is opt-in.** Empty params hide their feature
   (visitor counter, PWA, Pagefind, top-bar contact strip, …).
4. **Bilingual is a first-class feature**, not a bolt-on. The theme reads
   `Language.Direction` from `hugo.toml` to decide RTL/LTR — no
   hardcoded language codes anywhere.
5. **Demo site lives in `exampleSite/`.** Build it with
   `cd exampleSite && hugo server --themesDir ../..` to see every
   feature in one place.

## Conventions used in these docs

- Code paths are relative to the repo root (e.g. `layouts/partials/header.html`).
- "Site" means a downstream Hugo project that consumes this theme.
- "Theme" means this repository.
- Param paths use Hugo's dot notation: `Site.Params.theme.primaryColor`.
- TOML examples assume `hugo.toml`; sites using `config.yaml` or
  `config.json` work identically — only the syntax differs.
