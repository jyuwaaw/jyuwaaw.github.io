---
title: How to add a new post
date: 2026-06-18
category: meta
tags: [writing, site]
excerpt: Drop a markdown file in /posts and it shows up automatically. Here's the format.
---

Create a new `.md` file in the `posts/` folder. It goes into Blog by default — quick notes, links, or anything worth keeping. For a polished article, add `section: writing` and it appears on the Writing page instead.

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

- **`title`**, **`date`** — the essentials. `excerpt` is an optional summary for the index.
- **`section`** — defaults to `blog`. Use `writing` for essays and worked-through articles. Changing this never changes a post's URL.
- **`category`** — optional: `learning`, `projects`, or `meta` (the default). Blog shows category filters when there is more than one category. Use tags for any other topic.
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
