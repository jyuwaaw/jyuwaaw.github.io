---
title: Why the model never calls your MCP tools — pull vs. push
title_zh: MCP 工具没人调?Push 与 Pull 的心智模型
date: 2026-08-15
category: learning
tags: [mcp, claude-code, hooks, agents]
excerpt: A tool is a call the model may choose to place; a hook is a note the host forces in front of it. Where that line sits decides your agent design.
excerpt_zh: 工具是模型"可以选择拨打的电话",hook 是"必然塞到它眼前的纸条"——这条分界决定 agent 系统怎么设计。
source: https://github.com/NanoNets/Graft
---

An MCP tool is a phone call the model *may choose* to place; a hook is a note the host *forcibly puts in front of it* before work starts. However well you write a tool's description, calling it remains the model's in-the-moment decision. The fix that actually works is to take that decision away.

That's the move behind an r/mcp thread titled "I solved the issue of LLMs not calling my MCP tools" and its repo, [NanoNets/Graft](https://github.com/NanoNets/Graft) (this post distills that thread and my discussion in it). Instead of exposing a codebase map as an MCP tool and hoping the model calls it, Graft uses Claude Code hooks to inject the map into the prompt at fixed moments. In the author's words: there is nothing left to skip.

## Who owns which decision

| Role | Owns | Behavior |
|---|---|---|
| Model (LLM) | The choice, at every step | Only answers for what's already in the prompt; whether it calls a tool is its mood |
| MCP tool | Data / capability | Waits passively; if the model never calls, it idles forever |
| Host (Claude Code) | The hook mechanism | Runs code at fixed events and splices text into the prompt; the model can't skip it |
| Graft | The codebase map | The artifact the hooks inject |

<svg viewBox="0 0 760 510" width="100%" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Pull (MCP tools — the model decides) vs push (hooks — host code decides); both lanes end in the prompt</title>
  <defs>
    <marker id="ah-m-en" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--muted)"/></marker>
    <marker id="ah-a-en" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--accent)"/></marker>
  </defs>
  <rect x="20" y="12" width="350" height="36" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="35" text-anchor="middle" style="font-family:var(--mono);font-size:13px;fill:var(--muted)">PULL · MCP tool — the model decides</text>
  <rect x="390" y="12" width="350" height="36" rx="10" style="fill:var(--accent-dim);stroke:var(--accent)"/>
  <text x="565" y="35" text-anchor="middle" style="font-family:var(--mono);font-size:13px;fill:var(--accent)">PUSH · hook — host code decides</text>
  <rect x="60" y="78" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="109" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">Model at work</text>
  <rect x="430" y="78" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="101" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">Fixed event fires</text>
  <text x="565" y="119" text-anchor="middle" style="font-family:var(--mono);font-size:11px;fill:var(--faint)">session start · after an edit</text>
  <line x1="195" y1="130" x2="195" y2="172" stroke-dasharray="6 5" marker-end="url(#ah-m-en)" style="stroke:var(--muted);stroke-width:1.5"/>
  <text x="207" y="155" style="font-family:var(--mono);font-size:11px;fill:var(--faint)">may call — often never happens</text>
  <line x1="565" y1="130" x2="565" y2="172" marker-end="url(#ah-a-en)" style="stroke:var(--accent);stroke-width:1.5"/>
  <text x="577" y="155" style="font-family:var(--mono);font-size:11px;fill:var(--faint)">always runs</text>
  <rect x="60" y="176" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="207" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">MCP tool invoked</text>
  <rect x="430" y="176" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="207" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">Hook script runs</text>
  <line x1="195" y1="228" x2="195" y2="270" stroke-dasharray="6 5" marker-end="url(#ah-m-en)" style="stroke:var(--muted);stroke-width:1.5"/>
  <line x1="565" y1="228" x2="565" y2="270" marker-end="url(#ah-a-en)" style="stroke:var(--accent);stroke-width:1.5"/>
  <rect x="60" y="274" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="305" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">Result enters context</text>
  <rect x="430" y="274" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="305" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">stdout written into prompt</text>
  <line x1="195" y1="326" x2="275" y2="374" stroke-dasharray="6 5" marker-end="url(#ah-m-en)" style="stroke:var(--muted);stroke-width:1.5"/>
  <line x1="565" y1="326" x2="485" y2="374" marker-end="url(#ah-a-en)" style="stroke:var(--accent);stroke-width:1.5"/>
  <rect x="60" y="378" width="640" height="54" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="380" y="410" text-anchor="middle" style="font-family:var(--sans);font-size:15px;fill:var(--text)">Whatever makes it into the prompt, the model sees. Every time.</text>
  <line x1="60" y1="466" x2="108" y2="466" stroke-dasharray="6 5" style="stroke:var(--muted);stroke-width:1.5"/>
  <text x="120" y="470" style="font-family:var(--mono);font-size:12px;fill:var(--faint)">dashed = the model's own choice — may be skipped</text>
  <line x1="60" y1="492" x2="108" y2="492" style="stroke:var(--accent);stroke-width:1.5"/>
  <text x="120" y="496" style="font-family:var(--mono);font-size:12px;fill:var(--faint)">solid = code execution — always happens</text>
</svg>

## Why it's shaped this way

"Suggesting the model look" and "making the model see" are two different mechanisms. Tool calling is opt-in: the model acts on training priors and reaches for familiar, cheap actions — it has seen `grep` a million times; your new tool is a stranger. A good description is still just a suggestion. So whatever *must* be seen gets moved from the suggestion channel (tools) into the forced channel (hooks).

Force has a price: every injected character costs tokens, every time. The index/payload split is the cut between the two costs — keep a small map resident (push: guaranteed seen), leave the bulky detail behind tools (pull: paid for on demand). Pure push has its own failure mode: in a large repo, resident injection grows into exactly the context bloat you were fighting.

## The hook mechanism, concretely (Claude Code)

`settings.json` declares "at event X, run command Y". Events: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, and so on. A hook is the user's code running in the host process — the model can neither see nor modify it; its stdout gets spliced into the prompt. One-way injection, no negotiation. Graft installs two hooks: SessionStart injects a pre-generated map; PostToolUse (after edits) regenerates it to keep it fresh. CLAUDE.md is the primitive, static form of push; hooks are the programmable version. The same mechanism also runs in reverse: PreToolUse can intercept dangerous commands (git guardrails) — one face does "forced seeing", the other does "forced forbidding".

## Three layers, not two

1. **Seen** (hooks / injection) — fixes "the model doesn't know".
2. **Available** (tools) — fixes "the model has no hands".
3. **Enforced** (server-side validation, scopes, schemas) — fixes "the model said but didn't do".

The push-vs-pull argument only lives on layers 1 and 2. Hard guarantees always live on layer 3, because everything the first two layers produce still passes through the model's discretion. Related: progressive disclosure of tool catalogs (deferred tools + tool search — index resident, schemas on demand) attacks sprawl on the protocol side; hooks attack must-see on the host side. The two are orthogonal.

## A criterion you can reuse

Ask: *if the model never sees this — or sees it and ignores it — can I live with the outcome?* If not, it doesn't belong in the suggestion layer:

- Coding standards: prompt reminders (suggestion) vs. CI checks (enforcement)
- Secrets: "don't leak it" (suggestion) vs. keys never entering context, injected server-side (enforcement)
- Spending: "stay under budget" (suggestion) vs. a hard credit cap (enforcement)
- Automation boundaries: "drafts only" by convention (suggestion) vs. credentials scoped read-only (enforcement)

Every agent system shares this one axis: where the boundary sits between the model's discretion and code's determinism. What must be true every time belongs in the code layer; what needs judgment stays in the model layer.

<!-- zh -->

MCP 工具是"模型可以选择拨打的电话",hook 是"开工前必然塞到它眼前的纸条"。工具描述写得再好,打不打电话仍是模型临场决定的;真正管用的解法是拿走这个选择权。

这正是 r/mcp 帖子 "I solved the issue of LLMs not calling my MCP tools" 及其仓库 [NanoNets/Graft](https://github.com/NanoNets/Graft) 的做法(本文蒸馏自该帖与我在帖内的讨论)。Graft 不把代码库地图做成 MCP 工具去"等模型来调",而是用 Claude Code 的 hook 在固定时机把地图硬塞进 prompt——用作者的话说,"没有可以跳过的东西了"。

## 角色表

| 角色 | 拥有什么 | 做什么 |
|---|---|---|
| 模型(LLM) | 每一步的选择权 | 只对 prompt 里已有的内容负责;调不调工具看它心情 |
| MCP 工具 | 数据/能力 | 被动等调用,模型不来就永远闲着 |
| 宿主(Claude Code) | hook 机制 | 固定事件点跑代码,把文本写进 prompt,模型无权跳过 |
| Graft | 代码库地图文件 | hook 注入的就是这份地图 |

<svg viewBox="0 0 760 510" width="100%" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Pull(MCP 工具,决定权在模型)与 push(hook,决定权在宿主代码)的双车道对比,两条车道汇入同一个 prompt</title>
  <defs>
    <marker id="ah-m-zh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--muted)"/></marker>
    <marker id="ah-a-zh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--accent)"/></marker>
  </defs>
  <rect x="20" y="12" width="350" height="36" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="35" text-anchor="middle" style="font-family:var(--mono);font-size:13px;fill:var(--muted)">PULL · MCP 工具 — 决定权在模型</text>
  <rect x="390" y="12" width="350" height="36" rx="10" style="fill:var(--accent-dim);stroke:var(--accent)"/>
  <text x="565" y="35" text-anchor="middle" style="font-family:var(--mono);font-size:13px;fill:var(--accent)">PUSH · hook — 决定权在宿主代码</text>
  <rect x="60" y="78" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="109" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">模型干活中</text>
  <rect x="430" y="78" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="101" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">固定事件触发</text>
  <text x="565" y="119" text-anchor="middle" style="font-family:var(--mono);font-size:11px;fill:var(--faint)">session 开始 · 编辑之后</text>
  <line x1="195" y1="130" x2="195" y2="172" stroke-dasharray="6 5" marker-end="url(#ah-m-zh)" style="stroke:var(--muted);stroke-width:1.5"/>
  <text x="207" y="155" style="font-family:var(--sans);font-size:12px;fill:var(--faint)">可能去调用——常常根本不发生</text>
  <line x1="565" y1="130" x2="565" y2="172" marker-end="url(#ah-a-zh)" style="stroke:var(--accent);stroke-width:1.5"/>
  <text x="577" y="155" style="font-family:var(--sans);font-size:12px;fill:var(--faint)">必然执行</text>
  <rect x="60" y="176" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="207" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">MCP 工具被调用</text>
  <rect x="430" y="176" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="207" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">Hook 脚本运行</text>
  <line x1="195" y1="228" x2="195" y2="270" stroke-dasharray="6 5" marker-end="url(#ah-m-zh)" style="stroke:var(--muted);stroke-width:1.5"/>
  <line x1="565" y1="228" x2="565" y2="270" marker-end="url(#ah-a-zh)" style="stroke:var(--accent);stroke-width:1.5"/>
  <rect x="60" y="274" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--border-2)"/>
  <text x="195" y="305" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">结果进入上下文</text>
  <rect x="430" y="274" width="270" height="52" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="565" y="305" text-anchor="middle" style="font-family:var(--sans);font-size:14px;fill:var(--text)">stdout 写进 prompt</text>
  <line x1="195" y1="326" x2="275" y2="374" stroke-dasharray="6 5" marker-end="url(#ah-m-zh)" style="stroke:var(--muted);stroke-width:1.5"/>
  <line x1="565" y1="326" x2="485" y2="374" marker-end="url(#ah-a-zh)" style="stroke:var(--accent);stroke-width:1.5"/>
  <rect x="60" y="378" width="640" height="54" rx="10" style="fill:var(--surface);stroke:var(--accent)"/>
  <text x="380" y="410" text-anchor="middle" style="font-family:var(--sans);font-size:15px;fill:var(--text)">进了 prompt 的内容,模型一定看到。每一次。</text>
  <line x1="60" y1="466" x2="108" y2="466" stroke-dasharray="6 5" style="stroke:var(--muted);stroke-width:1.5"/>
  <text x="120" y="470" style="font-family:var(--sans);font-size:12px;fill:var(--faint)">虚线 = 模型自己决定——可能被跳过</text>
  <line x1="60" y1="492" x2="108" y2="492" style="stroke:var(--accent);stroke-width:1.5"/>
  <text x="120" y="496" style="font-family:var(--sans);font-size:12px;fill:var(--faint)">实线 = 代码执行——必然发生</text>
</svg>

## 为什么长这样

"建议模型去看"和"让模型必然看到"是两种机制。工具调用是 opt-in 的——模型按训练先验选熟悉便宜的动作(`grep` 见过一百万次,新工具是陌生人),描述再好也只是建议。所以把"必须看到的"从建议通道(工具)搬进强制通道(hook)。

但强制有价格:注入的每个字每次都花 token。Index/payload 分离就是在两个代价之间切分:小地图常驻(push,保证看到),大细节留在工具后面(pull,按需付费)。纯 push 的软肋:大仓库里常驻注入会自己长成新的上下文膨胀。

## Hook 具体机制(Claude Code)

`settings.json` 声明"某事件点运行某 shell 命令"。事件点:SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、Stop 等。hook 是用户的代码,跑在宿主进程,模型看不到也改不了;其 stdout 被宿主拼进 prompt。单向注入,无协商。Graft 装了两条 hook:SessionStart 注入预生成地图;PostToolUse(编辑后)重新生成保鲜。CLAUDE.md 是最原始的静态 push;hook 是可编程版。反向用法:PreToolUse 拦截危险命令(git guardrails)——同一机制,一面做"强制看见",一面做"强制禁止"。

## 三层图景(不止 push/pull 两层)

1. **看到**(hook/注入)——解决"模型不知道";
2. **可用**(工具)——解决"模型没有手";
3. **强制**(服务端校验、scope、schema)——解决"模型说到没做到"。

push/pull 之争只在 1、2 层;硬保证永远在第 3 层,因为前两层的产物都要过模型的自由裁量。相关:工具目录的渐进式披露(deferred tools + tool search = index 常驻 + schema 按需)在协议/服务侧解决 sprawl;hook 在宿主侧解决 must-see,两者正交。

## 通用判据(套到别的场景)

"这件事如果模型没看到/没照做,后果能不能接受?"不能接受的,不该留在建议层:

- 编码规范:prompt 叮嘱(建议)vs CI 拦截(强制)
- 密钥:叮嘱"别泄露"(建议)vs 密钥不进上下文、服务端代注入(强制)
- 花钱:叮嘱"别超预算"(建议)vs credit bucket 硬上限(强制)
- 自动化边界:"drafts only" 靠 prompt 自觉(建议)vs 凭证只给只读 scope(强制)

所有 agent 系统设计共享这条轴:模型的自由裁量与代码的确定性之间的边界摆哪。必须每次为真的进代码层;需要临场判断的留模型层。
