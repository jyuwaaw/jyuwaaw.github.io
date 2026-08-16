---
title: How to add a new post
date: 2026-06-18
category: meta
tags: [writing, site]
excerpt: Drop a markdown file in /posts and it shows up automatically. Here's the format.
---

Adding a post takes about ten seconds. Create a new `.md` file in the `posts/` folder and give it frontmatter at the top:

```md
---
title: My new post
date: 2026-07-01
category: learning
tags: [mcp, agents]
excerpt: One line that shows up on the cards.
---

Your content here, in plain markdown.
```

## The fields

- **`title`**, **`date`**, **`excerpt`** — required. English by default.
- **`category`** — exactly one of `learning` (daily learning notes), `projects` (things I built), or `meta` (about the site/writing itself). Shown as the card chip and filterable on the blog index.
- **`tags`** — optional open list, lowercase kebab-case (`[mcp, claude-code, rtl]`). Each tag gets its own page at `/blog/tag/<tag>/`.
- **`series`** — optional string. Posts sharing a series show a reading-order box.
- **`source`** — optional URL crediting the thread/repo/discussion the post came from.

## Bilingual posts

Posts are English-first with an optional Chinese variant. Add `title_zh` and `excerpt_zh` to the frontmatter, then put the Chinese body after an `<!-- zh -->` marker:

```md
---
title: My new post
title_zh: 中文标题
category: learning
excerpt: English card text.
excerpt_zh: 中文摘要。
---

English body…

<!-- zh -->

中文正文…
```

Readers get an EN / 中文 toggle on the post page; both variants ship in the static HTML.
