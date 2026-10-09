---
section: writing
title: The app has no API — so the local store is the API
title_zh: 没有 API 的应用，本地存储就是 API
date: 2026-08-19
category: projects
tags: [mcp, macos, reverse-engineering]
excerpt: MindNode Next ships no API, no AppleScript, and no files. I reverse-engineered its SQLite/CRDT library and built an MCP server on top — mindnode-mcp.
excerpt_zh: MindNode Next 没有 API、没有 AppleScript、连文件都没有。我逆向了它的 SQLite/CRDT 库，做了一个 MCP server。
source: https://github.com/jyuwaaw/mindnode-mcp
---

When an app ships no automation surface, it still has one: the local data store it must read its own documents from. You don't need the vendor to give you an API — the app already carries a complete, machine-readable description of every document, or it couldn't render them. The work is reading it without breaking anything.

[mindnode-mcp](https://github.com/jyuwaaw/mindnode-mcp) is that idea applied to [MindNode](https://mindnode.com). The current generation ("MindNode Next", 2024+) removed every conventional hook: no AppleScript dictionary, no CLI, no cloud API, and — the part that kills all older tooling — no `.mindnode` files. Documents now live in a private library. Twenty App Intents exist, but they are only reachable through the Shortcuts app, which is a person-shaped interface, not a program-shaped one. The received wisdom is "MindNode can't be automated." The library disagrees.

## Reading a store nobody documented

MindNode's library is a GRDB/SQLite database in its sandbox container. A document is not a row of content — it is a **base snapshot** plus a stream of **CRDT operation batches**, replayed in timestamp order. Getting from bytes to an outline takes four unwrappings:

<svg viewBox="0 0 720 250" width="100%" role="img" aria-label="mindnode-mcp read and write pipelines">
  <title>Read path decodes the library; write path rides the app's importer</title>
  <defs>
    <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--accent)"/></marker>
    <marker id="am" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/></marker>
  </defs>
  <text x="16" y="28" font-family="var(--mono)" font-size="11" fill="var(--accent)">READ · code-executed, read-only</text>
  <g font-family="var(--mono)" font-size="11.5" text-anchor="middle">
    <rect x="16" y="44" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="75" y="66" fill="var(--text)">SQLite library</text>
    <text x="75" y="82" fill="var(--muted)" font-size="10">snapshot + op batches</text>
    <rect x="166" y="44" width="100" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="216" y="66" fill="var(--text)">envelope</text>
    <text x="216" y="82" fill="var(--muted)" font-size="10">f12345 / f678910</text>
    <rect x="298" y="44" width="94" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="345" y="66" fill="var(--text)">Apple LZ4</text>
    <text x="345" y="82" fill="var(--muted)" font-size="10">bv41 frames</text>
    <rect x="424" y="44" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="483" y="66" fill="var(--text)">raw protobuf</text>
    <text x="483" y="82" fill="var(--muted)" font-size="10">CRDT ops, no schema</text>
    <rect x="574" y="44" width="130" height="52" rx="8" fill="var(--surface)" stroke="var(--accent)"/>
    <text x="639" y="66" fill="var(--accent)">Markdown</text>
    <text x="639" y="82" fill="var(--muted)" font-size="10">outline for the agent</text>
    <line x1="134" y1="70" x2="160" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#ar)"/>
    <line x1="266" y1="70" x2="292" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#ar)"/>
    <line x1="392" y1="70" x2="418" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#ar)"/>
    <line x1="542" y1="70" x2="568" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#ar)"/>
  </g>
  <text x="16" y="158" font-family="var(--mono)" font-size="11" fill="var(--muted)">WRITE · rides the app, never touches the DB</text>
  <g font-family="var(--mono)" font-size="11.5" text-anchor="middle">
    <rect x="16" y="174" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="75" y="196" fill="var(--text)">Markdown</text>
    <text x="75" y="212" fill="var(--muted)" font-size="10">outline in, temp file</text>
    <rect x="166" y="174" width="150" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="241" y="196" fill="var(--text)">open -a MindNode</text>
    <text x="241" y="212" fill="var(--muted)" font-size="10">LaunchServices</text>
    <rect x="348" y="174" width="150" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-dasharray="5 4"/>
    <text x="423" y="196" fill="var(--text)">app imports</text>
    <text x="423" y="212" fill="var(--muted)" font-size="10">silent, lossless</text>
    <line x1="134" y1="200" x2="160" y2="200" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#am)"/>
    <line x1="316" y1="200" x2="342" y2="200" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#am)"/>
    <path d="M 498 200 L 560 200 L 560 110 L 75 110 L 75 100" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#am)"/>
  </g>
  <text x="16" y="244" font-family="var(--mono)" font-size="10" fill="var(--faint)">solid = executed by mindnode-mcp · dashed = MindNode's own code</text>
</svg>

Three details carried the project. First, every blob is wrapped in a two-field protobuf envelope whose field numbers are 12345 and 678910 — developer humor, but stable, and a useful fingerprint. Second, the payload compression is Apple's LZ4 framing (`bv41` block magic), decodable with a ~50-line pure-TypeScript block decoder. Third, you don't need the vendor's `.proto` schema: protobuf's wire format is self-describing enough to parse blind, and the meaningful records — node creation `(child, parent)`, text runs per node — are recognizable by shape. The full field map is in the repo's [FORMAT.md](https://github.com/jyuwaaw/mindnode-mcp/blob/main/docs/FORMAT.md).

The CRDT text encoding is the one part I read approximately: position metadata isn't fully mapped, so heavily edited strings can come back slightly scrambled. The honest fix is built in — MindNode caches its own rendered JPEG of every document, so the server exposes `get_mindmap_image` as pixel-perfect ground truth next to the best-effort outline.

## Who owns what

| Surface | Owner | How mindnode-mcp uses it |
| --- | --- | --- |
| `Content.sqlite3` + snapshots | MindNode, CloudKit-synced | decoded **read-only** — never written |
| Markdown importer | MindNode | the entire write path (`create_mindmap`) |
| `mindnode://` URL scheme | MindNode | open a document by id |
| App Intents (×20) | MindNode, gated behind Shortcuts | not yet — planned for node-level edits |

The table is the safety argument: the database is shared mutable state between the app and CloudKit, so the server never writes it. Creating documents rides MindNode's own importer — `open -a MindNode note.md` imports silently and losslessly — which means every byte in the library was written by MindNode itself.

## Why I wanted this

My working memory is a mind map — one per day. Raycast summons MindNode on a single keystroke, so capturing a thought costs under a second, which is the only speed at which capture actually happens. The gap was on the way out: the map held the day's context and no agent could read it. Now the loop closes — at the end of the day Claude reads the map, drafts the work log or a post like this one, and can seed tomorrow's map from open threads. Capture stays human and instant; synthesis becomes the agent's job.

The transferable checklist, for the next "un-automatable" app: find the local store; expect an envelope and compression you can fingerprint from magic bytes; parse protobuf without a schema and match records by shape; use the app's own importer as the write path; use the app's own renders as ground truth; and never write shared state you don't own.

<!-- zh -->

一个不提供自动化接口的应用，其实始终暴露着一个接口：它自己渲染文档时必须读取的本地存储。不需要等厂商开放 API——应用本地必然携带一份完整的、机器可读的文档描述，否则它自己也画不出来。要做的只是在不破坏任何东西的前提下把它读出来。

[mindnode-mcp](https://github.com/jyuwaaw/mindnode-mcp) 就是这个思路在 [MindNode](https://mindnode.com) 上的落地。新一代 MindNode（"MindNode Next"，2024+）把传统的自动化钩子拆了个干净：没有 AppleScript 字典、没有 CLI、没有云端 API，最致命的是——连 `.mindnode` 文件都没有了，文档全部进了私有库。它其实带着 20 个 App Intents，但只能从"快捷指令"App 里触达，那是给人用的形状，不是给程序用的形状。所以社区的共识是"MindNode 没法自动化"。但它的库不同意。

## 读一个没人写文档的存储

MindNode 的库是沙盒容器里的一个 GRDB/SQLite 数据库。文档不是一行内容，而是一份**基础快照**加一串 **CRDT 操作批次**，按时间戳顺序重放。从字节到大纲要剥四层：

<svg viewBox="0 0 720 250" width="100%" role="img" aria-label="mindnode-mcp 读写管线">
  <title>读路径解码本地库；写路径借道应用自己的导入器</title>
  <defs>
    <marker id="arz" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--accent)"/></marker>
    <marker id="amz" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/></marker>
  </defs>
  <text x="16" y="28" font-family="var(--mono)" font-size="11" fill="var(--accent)">读 · 代码执行，只读</text>
  <g font-family="var(--mono)" font-size="11.5" text-anchor="middle">
    <rect x="16" y="44" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="75" y="66" fill="var(--text)">SQLite 库</text>
    <text x="75" y="82" fill="var(--muted)" font-size="10">快照 + 操作批次</text>
    <rect x="166" y="44" width="100" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="216" y="66" fill="var(--text)">信封层</text>
    <text x="216" y="82" fill="var(--muted)" font-size="10">f12345 / f678910</text>
    <rect x="298" y="44" width="94" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="345" y="66" fill="var(--text)">Apple LZ4</text>
    <text x="345" y="82" fill="var(--muted)" font-size="10">bv41 帧</text>
    <rect x="424" y="44" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="483" y="66" fill="var(--text)">裸 protobuf</text>
    <text x="483" y="82" fill="var(--muted)" font-size="10">CRDT 操作，无 schema</text>
    <rect x="574" y="44" width="130" height="52" rx="8" fill="var(--surface)" stroke="var(--accent)"/>
    <text x="639" y="66" fill="var(--accent)">Markdown</text>
    <text x="639" y="82" fill="var(--muted)" font-size="10">给 agent 的大纲</text>
    <line x1="134" y1="70" x2="160" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arz)"/>
    <line x1="266" y1="70" x2="292" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arz)"/>
    <line x1="392" y1="70" x2="418" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arz)"/>
    <line x1="542" y1="70" x2="568" y2="70" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arz)"/>
  </g>
  <text x="16" y="158" font-family="var(--mono)" font-size="11" fill="var(--muted)">写 · 借道应用，绝不碰数据库</text>
  <g font-family="var(--mono)" font-size="11.5" text-anchor="middle">
    <rect x="16" y="174" width="118" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="75" y="196" fill="var(--text)">Markdown</text>
    <text x="75" y="212" fill="var(--muted)" font-size="10">大纲写入临时文件</text>
    <rect x="166" y="174" width="150" height="52" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="241" y="196" fill="var(--text)">open -a MindNode</text>
    <text x="241" y="212" fill="var(--muted)" font-size="10">LaunchServices</text>
    <rect x="348" y="174" width="150" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-dasharray="5 4"/>
    <text x="423" y="196" fill="var(--text)">应用自行导入</text>
    <text x="423" y="212" fill="var(--muted)" font-size="10">静默、无损</text>
    <line x1="134" y1="200" x2="160" y2="200" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#amz)"/>
    <line x1="316" y1="200" x2="342" y2="200" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#amz)"/>
    <path d="M 498 200 L 560 200 L 560 110 L 75 110 L 75 100" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#amz)"/>
  </g>
  <text x="16" y="244" font-family="var(--mono)" font-size="10" fill="var(--faint)">实线 = mindnode-mcp 执行 · 虚线 = MindNode 自己的代码</text>
</svg>

三个细节撑起了整个项目。其一，每个 blob 都裹着一个只有两个字段的 protobuf 信封，字段号是 12345 和 678910——开发者的彩蛋，但它稳定，而且是极好用的格式指纹。其二，负载压缩是 Apple 的 LZ4 帧格式（块魔数 `bv41`），五十来行纯 TypeScript 就能解。其三，不需要厂商的 `.proto` schema：protobuf 的线格式足够自描述，可以盲解，而真正有意义的记录——节点创建 `(child, parent)`、每个节点的文本 run——靠形状就能认出来。完整的字段映射在仓库的 [FORMAT.md](https://github.com/jyuwaaw/mindnode-mcp/blob/main/docs/FORMAT.md)。

CRDT 文本编码是我唯一"读个大概"的部分：位置元数据没有完全映射，被反复编辑过的句子读回来可能轻微乱序。诚实的兜底直接做进了工具里——MindNode 会为每个文档缓存自己渲染的 JPEG，server 把它暴露为 `get_mindmap_image`，在尽力而为的大纲旁边放一份像素级真值。

## 谁拥有什么

| 接口面 | 所有者 | mindnode-mcp 怎么用 |
| --- | --- | --- |
| `Content.sqlite3` + 快照 | MindNode，CloudKit 同步 | **只读**解码——永不写入 |
| Markdown 导入器 | MindNode | 整条写路径（`create_mindmap`） |
| `mindnode://` URL scheme | MindNode | 按 id 打开文档 |
| App Intents（×20） | MindNode，锁在快捷指令后面 | 还没用——留给节点级编辑 |

这张表就是安全论证：数据库是应用和 CloudKit 之间的共享可变状态，所以 server 一个字节都不写。新建文档借道 MindNode 自己的导入器——`open -a MindNode note.md` 静默且无损——于是库里的每个字节都出自 MindNode 自己之手。

## 我为什么要做这个

我的工作记忆是思维导图——一天一张。Raycast 一键唤起 MindNode，记录一个念头的成本不到一秒，而只有这个速度下记录才真的会发生。缺口在出口侧：导图装着一整天的上下文，却没有任何 agent 读得到。现在环闭上了——一天结束时 Claude 读图、起草工作日志或者这样一篇博文，还能从未收尾的线头里生成明天的图。记录留给人、保持即时；综合交给 agent。

可迁移的清单，留给下一个"没法自动化"的应用：找到本地存储；预期有信封层和压缩层，靠魔数指纹识别；无 schema 盲解 protobuf、按形状认记录；用应用自己的导入器当写路径；用应用自己的渲染当真值；永远不要写入你不拥有的共享状态。
