---
title: How to add a new post
date: 2026-06-18
tag: Guide
excerpt: Drop a markdown file in /posts and it shows up automatically. Here's the format.
---

Adding a post takes about ten seconds. Create a new `.md` file in the `posts/` folder and give it frontmatter at the top:

```md
---
title: My new post
date: 2026-07-01
tag: Hardware
excerpt: One line that shows up on the cards.
---

Your content here, in plain markdown.
```

## The fields

- `title` — shows as the headline.
- `date` — used for sorting (newest first) and display. Use `YYYY-MM-DD`.
- `tag` — the little green label on the card.
- `excerpt` — the one-line summary on the blog index and homepage.

Everything below the frontmatter is standard markdown: headings, lists, `inline code`, code blocks, and links.

That's it — save the file, commit, and it deploys automatically.
