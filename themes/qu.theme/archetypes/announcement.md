---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
# Category drives the i18n badge — must match one of the
# `category_<value>` keys in your i18n bundle. Defaults shipped by the
# theme: administrative, academic, students, general.
type: "general"
# Set to true to highlight the announcement card and add an "Important" badge.
important: false
---

