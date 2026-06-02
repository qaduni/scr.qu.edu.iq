---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
# Optional cover image (relative to /assets/ or absolute URL)
image: ""
imageAlt: ""
# `type` controls the badge shown on news/announcement cards and the
# data-pagefind-filter set on the article. Defaults to "News" when omitted.
# Use a category-specific value (administrative | academic | students | general)
# only when the post is an announcement.
type: "news"
---

