# 15. Extending the theme

Recipes for the most common "I want to add something" changes.

---

## Add a new homepage section

**Goal**: insert a "Faculty" cards section between Services and Quick
Links.

1. **Create the partial** `layouts/partials/sections/faculty.html`:

   ```hugo
   {{ with index .Site.Menus "homepage_faculty" }}
   <section class="section">
     <div class="container">
       <div class="section-header">
         <h2>{{ i18n "faculty_title" }}</h2>
         <p>{{ i18n "faculty_subtitle" }}</p>
       </div>
       <div class="cards-grid">
         {{ range . }}
         <div class="card">
           {{ with .Params.icon }}
           <div class="card-icon">
             <svg width="28" height="28"><use href="#icon-{{ . }}"></use></svg>
           </div>
           {{ end }}
           <h3>{{ .Name }}</h3>
           {{ with .Params.description }}<p>{{ . }}</p>{{ end }}
           <a href="{{ .URL }}" class="card-link">
             {{ i18n "view_details" }}
             <svg width="16" height="16"><use href="#icon-arrow-right"></use></svg>
           </a>
         </div>
         {{ end }}
       </div>
     </div>
   </section>
   {{ end }}
   ```

2. **Wire it into `layouts/index.html`**:

   ```hugo
   {{ partial "sections/hero.html" . }}
   {{ partial "sections/services.html" . }}
   {{ partial "sections/faculty.html" . }}   <!-- NEW -->
   {{ partial "sections/quick-links.html" . }}
   ...
   ```

3. **Add i18n keys** to `i18n/en.yaml` and `i18n/ar.yaml`:

   ```yaml
   faculty_title: "Faculty"
   faculty_subtitle: "Meet our researchers and lecturers"
   ```

4. **Add the menu entries** in `config/_default/menus.<lang>.toml`:

   ```toml
   [[homepage_faculty]]
     name = "Computer Science"
     url  = "/faculty/cs/"
     [homepage_faculty.params]
       icon = "graduation"
       description = "20 staff across 4 research groups"
   ```

5. **(Optional) Add component CSS** at
   `assets/css/components/_faculty.css` and append to the `$cssFiles`
   slice in `layouts/_default/baseof.html`.

The section self-suppresses when `homepage_faculty` is empty, so the
template change is safe to merge before the menu is populated.

---

## Add a new icon

1. Pick a 24×24 viewBox SVG path (Lucide / Feather / Heroicons all work).
2. Add to `layouts/partials/icons.html`:

   ```html
   <symbol id="icon-MYICON" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true">
     <path d="..."/>
   </symbol>
   ```

3. Reference from any menu entry or template:

   ```toml
   [quick_links.params]
     icon = "MYICON"        # no icon- prefix
   ```

The icon inherits text colour via `currentColor`. For brand glyphs
(coloured), use `fill="currentColor"` with no `stroke`.

---

## Add a new shortcode

**Goal**: a `{{< youtube id="dQw4w9WgXcQ" >}}` embed.

`layouts/shortcodes/youtube.html`:

```hugo
{{- $id := .Get "id" -}}
{{- if $id -}}
<div class="video-embed" style="aspect-ratio: 16/9;">
  <iframe src="https://www.youtube-nocookie.com/embed/{{ $id }}"
          title="YouTube video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"></iframe>
</div>
{{- end -}}
```

Usage in any markdown file:

```markdown
{{</* youtube id="dQw4w9WgXcQ" */>}}
```

---

## Add a new language

See [`07-i18n-and-rtl.md`](07-i18n-and-rtl.md) for the full procedure.
Summary:

1. Add `[languages.<code>]` block to `hugo.toml`.
2. Ship `i18n/<code>.yaml`.
3. (Optional) Ship language-specific content and a menu file.

No template changes required.

---

## Add a new content section

**Goal**: a `/research/` section.

1. Create `content/research/_index.md` and a few child pages.
2. **Pick a section style** via `_index.md` front matter:
   - **Card grid (default)** — leave `layout` unset. Subpages render
     as cards with icon + title + description + "Read more" link. Best
     for sections where subpages are landing pages themselves
     (like `/about/`).
   - **Article list** — set `layout: "list"`. Subpages render
     chronologically with date blocks, optional category/priority
     badges, and an optional Pagefind search bar at the top. Best for
     sections of dated content (like `/news/`).
3. **Want the homepage to show a research strip?** Copy
   `layouts/partials/sections/news-grid.html` to
   `layouts/partials/sections/research.html`, swap the section path to
   `/research`, and add it to `layouts/index.html`.
4. **Want a custom list layout for just this section?** Add
   `layouts/research/list.html` — Hugo's lookup order prefers it over
   `_default/list.html`. Start by copying `_default/list.html` and
   editing from there.

---

## Add front-matter-driven page styling

To allow individual pages to opt into a custom CSS class:

1. Edit `layouts/_default/single.html`:

   ```hugo
   <article class="article-content {{ with .Params.layout }}layout-{{ . }}{{ end }}" data-pagefind-body>
   ```

2. Add `layout: "wide"` to a page's front matter.
3. Style `.article-content.layout-wide` in
   `assets/css/components/_content.css`.

---

## Add a new schema.org `@type`

JSON-LD `@type` is read from `Site.Params.schema.type`. Valid values
include any schema.org `Organization` subtype:

- `"Organization"` (default)
- `"EducationalOrganization"` (used by demo)
- `"CollegeOrUniversity"`, `"School"`, `"ResearchOrganization"`
- `"GovernmentOrganization"`, `"NGO"`, `"Corporation"`

For a non-Organization root type (e.g. `"GovernmentBuilding"`), you'd
need to edit `layouts/_default/baseof.html` directly — the param-driven
shape currently assumes Organization-style properties (`logo`, `sameAs`,
`contactPoint`).

---

## Inject custom HTML into `<head>`

Override `baseof.html` from your site, or use the existing block:

```hugo
{{/* In a template that has its own define "main" */}}
{{ define "head" }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
{{ end }}
```

`baseof.html` ends with `{{ block "head" . }}{{ end }}` immediately
before `</head>`, so anything you define renders there.

---

## Inject custom JS at the end of `<body>`

Same pattern with the `scripts` block:

```hugo
{{ define "scripts" }}
  <script defer src="/my-analytics.js"></script>
{{ end }}
```

---

## Customise a single partial without forking

Hugo's lookup order means your **site's** `layouts/partials/X.html`
takes precedence over the theme's. Copy any theme partial into the
matching path in your site repo, edit, done. No fork needed.

This is the recommended way to customise:

- The header logo block (add a tagline, swap to a different layout).
- The footer columns layout.
- The hero section copy / structure.
- The visitor counter widget.
