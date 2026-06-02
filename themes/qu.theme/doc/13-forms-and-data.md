# 13. Forms and data files

The theme ships two pre-built forms (contact + graduate survey) and a
Google Maps embed shortcode. All three are designed to **fail safely**
when not configured — no broken submissions, just a graceful fallback.

## `{{< contact-form >}}`

### What it does

Renders a contact form with name, email, phone, subject (dropdown),
message. Submits to whatever URL is set in
`Site.Params.contactFormEndpoint`.

### Subject taxonomy

The subject `<select>` options come from `data/contactForm.yaml`:

```yaml
subjects:
  - value: "general"
    i18nKey: "form_subject_general"
  - value: "academic"
    i18nKey: "form_subject_academic"
  - value: "admission"
    i18nKey: "form_subject_admission"
  - value: "technical"
    i18nKey: "form_subject_technical"
  - value: "other"
    i18nKey: "form_subject_other"
```

Each entry has a `value` (what's POSTed) and either a literal `label`
(used verbatim) or an `i18nKey` (resolved through the i18n bundle).
**Literal `label` takes priority** when both are present.

To override the subject list for your institution, place the file at
your **site's** `data/contactForm.yaml`:

```yaml
# YOUR-SITE/data/contactForm.yaml
subjects:
  - value: "tuition"
    label: "Tuition & fees"           # used verbatim
  - value: "library"
    i18nKey: "form_subject_library"   # resolves via i18n; ship the key
```

### Endpoint contract

The form does an HTML POST with `application/x-www-form-urlencoded`
(default browser behaviour). Field names:

| Field     | Required | Type   |
| --------- | -------- | ------ |
| `name`    | Yes      | string |
| `email`   | Yes      | email  |
| `phone`   | No       | string |
| `subject` | Yes      | string (one of the `value` fields above) |
| `message` | Yes      | textarea content |

Compatible endpoints: Formspree, Getform, Web3Forms, Netlify Forms,
your own server.

### Fallback when unconfigured

If `Site.Params.contactFormEndpoint` is empty:

```html
<div class="form-disabled-note" role="status">
  <p>The contact form is not currently enabled. Please email us at:
  <a href="mailto:info@example.org">info@example.org</a></p>
</div>
```

The `mailto:` link uses `Site.Params.contact.email`.

---

## `{{< graduate-form >}}`

### What it does

A multi-section graduate alumni survey: personal info, academic info,
employment status, free-text feedback. Same submit semantics as
`contact-form`.

### Option taxonomies

Three lists come from `data/graduateForm.yaml`:

```yaml
graduationYears:
  - value: "2025"
    label: "2025"             # literal — no i18n needed
  - value: "older"
    i18nKey: "form_year_older"

organizations:
  - value: "other"
    i18nKey: "form_organization_other"
  ...

employmentStatuses:
  - value: "employed"
    i18nKey: "form_status_employed"
  ...
```

Override at your site's `data/graduateForm.yaml`.

### Field list

| Field            | Required | Source           |
| ---------------- | -------- | ---------------- |
| `fullName`       | Yes      | text             |
| `email`          | Yes      | email            |
| `phone`          | Yes      | tel              |
| `graduationYear` | Yes      | `graduationYears` |
| `college`        | Yes      | `colleges`       |
| `department`     | Yes      | text             |
| `employmentStatus` | Yes    | `employmentStatuses` |
| `employer`       | No       | text             |
| `jobTitle`       | No       | text             |
| `feedback`       | No       | textarea         |

### Fallback when unconfigured

Same shape as the contact-form fallback, using a different i18n key
(`graduate_form_unavailable`) and the same `Site.Params.contact.email`.

---

## `{{< google-map >}}`

A thin Google Maps iframe wrapper.

```hugo
{{</* google-map */>}}                                     <!-- uses Site.Params.campusMapEmbed -->
{{</* google-map src="https://..." height="500" */>}}      <!-- custom -->
{{</* google-map src="..." height="500" title="Campus" */>}}
```

Renders nothing when both `.Get "src"` and `Site.Params.campusMapEmbed`
are empty — no broken iframe.

The `src` should be the **embed URL** from Google Maps (Share → Embed a
map → Copy the `src` from the `<iframe>`). Pasting the regular Maps URL
doesn't work.

---

## Adding a new form

The pattern is consistent — copy `layouts/shortcodes/contact-form.html`
as a template:

1. Decide an endpoint param name: `Site.Params.myFormEndpoint`.
2. Optionally define option lists in `data/myForm.yaml`.
3. In the shortcode template:
   - Read the endpoint param.
   - If empty, render the i18n-keyed fallback message.
   - Otherwise, render a `<form action="{{ $action }}" method="POST">`.
4. Ship i18n keys for labels, button text, and the fallback message in
   `i18n/en.yaml` (and translate them in every other shipped language).

The `i18nKey` / `label` fallback pattern in your data file lets you mix
verbatim and translatable labels without changing template code.
