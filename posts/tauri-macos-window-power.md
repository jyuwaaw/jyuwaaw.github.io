---
section: writing
title: A transparent Tauri window and a 60 W MacBook
title_zh: 一个 Tauri 透明窗口，和一台跑到 60 W 的 MacBook
date: 2026-11-19
category: learning
tags: [macos, tauri, appkit]
excerpt: The fans spun up with a desktop client open. Checking the native window revealed that a translucent sidebar and a transparent Mac window had been coupled.
excerpt_zh: 桌面客户端开着，风扇就转了起来。沿着侧栏往下查，才发现网页需要透出材质，而外层的 Mac 窗口也跟着开了透明。
---

The fans were the first thing I noticed. With our Tauri desktop client open on my 14-inch M5 Pro MacBook Pro, GPU usage climbed above 90% and whole-machine power reached 60 W. The native SwiftUI client had shown 12–18 W in a separate observation. That was enough to make me inspect the window. A controlled comparison would have to come later.

## What was the sidebar showing through?

The sidebar used a macOS material. In our Tauri configuration, enabling transparency let the inner WebKit view show an AppKit material underneath it. That was the effect I wanted. The same setting also left the outer `NSWindow` with a clear background and `isOpaque` set to `false`.

Those two surfaces had different jobs. The web view needed to reveal the material behind the sidebar. The material already covered the entire window, so the outer window could have a solid backing. Declaring that window transparent gave the compositor reason to consider content behind it on every update. [Apple’s documentation for NSWindow.isOpaque](https://developer.apple.com/documentation/appkit/nswindow/isopaque)

## What the fix established

After installing the material, we gave the native window a solid background and marked it opaque. The web view kept its transparency. We added a check that opened both the main window and a standalone session window and verified that each reported `isOpaque == true`. Checking both mattered because they were created separately.

That check answers a precise question about the fix. The remaining question is how many watts it saves. I don’t have a post-change power reading from the same MacBook. For that comparison I’d hold the open sessions, window dimensions, and display brightness steady, let both builds settle, and record whole-machine power and GPU activity over the same interval.

<!-- zh -->

最先引起我注意的是风扇。14 英寸 M5 Pro MacBook Pro 上开着我们的 Tauri 桌面客户端，GPU 占用超过 90%，整机功耗一度到了 60 W。之前单独观察原生 SwiftUI 客户端时，我看到的是 12–18 W。两次运行条件没有对齐，不过这个差距足以让我去看一眼窗口是怎么创建的。

## 侧栏到底要透出哪一层？

侧栏用了一层 macOS 原生材质。Tauri 开启透明后，内层 WebKit 视图能透出底下的 AppKit 材质，侧栏的效果就出来了。顺着这条设置再往下看，外层的 `NSWindow` 也用了透明背景，`isOpaque` 是 `false`。

我需要的透明只发生在窗口里面，网页要露出下面那层材质。材质已经铺满了整个窗口，外层完全可以有实色背景。把外层也标成透明，意味着窗口每次更新，系统合成画面时都得考虑它背后的内容。[Apple 对 NSWindow.isOpaque 的说明](https://developer.apple.com/documentation/appkit/nswindow/isopaque)

## 这次改动验证到了哪一步

我们在材质就位后，给原生窗口设了实色背景，并把它标成不透明。里面的网页依然可以透出侧栏材质。主窗口和独立会话窗口是分别创建的，所以自动检查会把两个都打开，逐一确认 `isOpaque == true`。

现在能确认的是两个窗口都拿到了预期的属性。至于实际省下多少瓦，我手里还缺同一台 MacBook 改完后的读数。下次测量，我会固定打开的会话、窗口大小和屏幕亮度，让两个版本分别稳定下来，再取相同时长的整机功耗和 GPU 占用来比较。
