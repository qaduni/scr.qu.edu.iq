# 6. Content model

The theme renders any Hugo section using the standard list / single
templates. Two sections are **special**: news and announcements. This
document covers both.

## Where content lives

```
content/
├── _index.md                 # Homepage front matter (rarely customised)
├── about/
│   ├── _index.md
│   ├── mission.md
│   └── team.md
├── news/
│   ├── _index.md
│   └── 2026-01-15-welcome.md
├── announcements/
│   ├── _index.md
│   └── launch.md
└── contact/
    └── _index.md
```

The section paths above are the defaults; override them via
`Site.Params.contentSections.{news,announcements,contact}`.

## Creating new posts via archetypes

The theme ships three archetypes:

- `archetypes/default.md` — generic title/date/description stub.
- `archetypes/news.md` — adds `image`, `imageAlt`, `type: "news"`.
- `archetypes/announcement.md` — adds `type: "general"`, `important: false`.

```sh
hugo new news/2026-01-15-graduation.md
hugo new announcements/exam-schedule.md
```

Hugo picks the archetype matching the section name; falls back to
`default.md` otherwise.

## News section

**Default path**: `/news` (override at `Site.Params.contentSections.news`).

### Front matter the theme reads

| Field         | Type    | Effect                                                                                |
| ------------- | ------- | ------------------------------------------------------------------------------------- |
| `title`       | string  | Card title, page H1.                                                                  |
| `description` | string  | OG/meta description, card body fallback.                                              |
| `date`        | date    | Sort key, badge.                                                                      |
| `image`       | string  | Cover image URL/path. Used by homepage news strip + (if site customises) single page. |
| `imageAlt`    | string  | Alt text for cover. Falls back to `title`.                                            |
| `type`        | string  | `"news"` (default). Other values are treated as announcement categories.              |
| `icon`        | string  | Sprite id for section grid cards on `section.html`.                                   |

### Where news is consumed

1. **Homepage strip** (`partials/sections/news-grid.html`):
   first 3 by `Date` desc.
2. **List page** (`layouts/_default/list.html`, opt-in via
   `layout: "list"` in `news/_index.md`): chronological article list
   with optional Pagefind search bar and windowed pagination.
3. **Single page** (`layouts/_default/single.html`):
   with Pagefind filter metadata.

## Announcements section

**Default path**: `/announcements`.

### Front matter the theme reads

| Field         | Type    | Effect                                                                                                            |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`       | string  | Card title, page H1.                                                                                              |
| `description` | string  | OG/meta description, card body fallback.                                                                          |
| `date`        | date    | Sort key, badge.                                                                                                  |
| `type`        | string  | Category — `administrative`, `academic`, `students`, `general`, or any custom value with a matching i18n key.     |
| `important`   | boolean | If `true`, the card gets `.priority-high` styling and an "Important" badge. Use sparingly.                        |

### Category badges and i18n

The category badge label comes from `i18n "category_<value>"`. The theme
ships:

```
category_administrative
category_academic
category_research
category_community
category_general
```

To add a new category, drop a key into your site's `i18n/<lang>.yaml`:

```yaml
# i18n/en.yaml
category_research: "Research"

# i18n/ar.yaml
category_research: "البحث العلمي"
```

…and use `type: "research"` in front matter. The single-page template
also surfaces this value as a Pagefind filter (see
[`12-search-pagefind.md`](12-search-pagefind.md)).

### Where announcements are consumed

1. **Homepage strip** (`partials/sections/announcements.html`):
   first 4 by `Date` desc.
2. **List page** (`layouts/_default/list.html`, opt-in via
   `layout: "list"` in `announcements/_index.md`): chronological list,
   priority items get the accent border-left and the "Important" badge.
3. **Single page**: same as news, with the category badge.

## Generic sections (about, services, …)

Sections render in one of two styles, picked via the section's
`_index.md` front matter:

- **Card grid (default)** — `_default/section.html`. Renders
  `_index.md`'s `.Content` first, then a `.cards-grid` of child pages
  with title + description + icon. Use the `icon: "graduation"`
  front-matter key on each child to give its card a sprite icon. This
  is what `/about/` and `/contact/` use.
- **Article list** — `_default/list.html`, opt-in by setting
  `layout: "list"` in `_index.md`. Renders a chronological list with
  date blocks, optional category/priority badges, and optional Pagefind
  search bar. This is what `/news/` uses.

Single pages all share `_default/single.html`: breadcrumb (Home →
Section → Page) + the page body inside `.article-content`.

## Hero stats (optional, data-driven)

The hero section can display a row of metrics tiles ("15,000+ Students /
250 Faculty / 30 Programs / 50 Years") underneath the CTA buttons.
This is **opt-in via a data file** — universities and colleges use it,
departments and research centres typically omit it.

To enable, create `data/heroStats.yaml` at your site root:

```yaml
- value: "15,000+"
  i18nKey: "stat_members"
- value: "250"
  i18nKey: "stat_staff"
- value: "30"
  i18nKey: "stat_programs"
- value: "50"
  i18nKey: "stat_years"
```

To disable, delete the file (or leave it absent). The hero partial
self-suppresses when no data is present.

**Fields per entry:**

| Field      | Type   | Effect                                                              |
| ---------- | ------ | ------------------------------------------------------------------- |
| `value`    | string | Free-text number, format however you want: `"15K"`, `"98%"`, `"120"` |
| `i18nKey`  | string | Translation key looked up in `i18n/<lang>.yaml`. Takes precedence over `label`. |
| `label`    | string | Static label, used when `i18nKey` is absent. Convenient for single-language sites. |

**Built-in i18n keys** (en + ar provided): `stat_members`,
`stat_staff`, `stat_programs`, `stat_years`, `stat_partners`,
`stat_projects`, `stat_publications`. Add your own by appending to
your site's `i18n/<lang>.yaml`.

The CSS grid auto-fits, so 1–6+ entries all lay out cleanly.

## Translations

For multilingual sites, use Hugo's translation-by-filename convention:

```
content/
└── news/
    ├── welcome.md             # default language (per defaultContentLanguage)
    └── welcome.ar.md          # Arabic translation
```

The language switcher links to the matching translation if one exists,
otherwise to the target language's homepage. Translation-by-content-dir
(`content.en/`, `content.ar/`) also works — it's a stylistic choice.

## Front-matter cheat sheet

```yaml
# News
---
title: "Annual Open Day"
description: "Doors open to prospective students 9–17 February."
date: 2026-02-09
type: "news"
image: "/images/openday.webp"
imageAlt: "Students walking through the main hall"
---

# Announcement
---
title: "Exam schedule released"
description: "Final exam timetable now published."
date: 2026-05-20
type: "academic"
important: true
---

# About child page
---
title: "Our Mission"
description: "Why the institution exists."
icon: "award"
---
```
