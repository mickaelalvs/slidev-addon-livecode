# 🛶 slidev-addon-livecode

[![npmx](https://img.shields.io/npm/v/slidev-addon-livecode?style=for-the-badge&logo=npm&logoColor=white&label=npmx&labelColor=000000&color=18181b)](https://npmx.dev/package/slidev-addon-livecode)
[![npm](https://img.shields.io/npm/v/slidev-addon-livecode?style=for-the-badge&logo=npm&logoColor=white&labelColor=cb0000&color=18181b)](https://www.npmjs.com/package/slidev-addon-livecode)
[![license](https://img.shields.io/github/license/mickaelalvs/slidev-addon-livecode?style=for-the-badge&labelColor=3da639&color=18181b)](./LICENSE)
[![slidev](https://img.shields.io/badge/slidev-%3E%3D52-18181b?style=for-the-badge&logo=slidev&logoColor=white&labelColor=2b90b6&color=18181b)](https://sli.dev)

Embed a live VS Code IDE in your [Slidev](https://sli.dev) presentations.

Powered by [coderaft](https://github.com/pithings/coderaft), a zero-dependency redistribution of code-server that installs in under a second.

## 📦 Install

```bash
pnpm add slidev-addon-livecode coderaft
```

Register the addon in your frontmatter:

```yaml
---
addons:
  - livecode
---
```

## 🚀 Basic usage

```yaml
---
addons:
  - livecode
---

# My slide

<Editor session="demo" />
```

That's it. When you navigate to the slide, a VS Code instance starts automatically and loads inside the slide.

## 📂 Open a specific workspace

```vue
<Editor session="demo" defaultFolder="/path/to/your/project" />
```

Both absolute and relative paths are supported. Relative paths are resolved from the Slidev project root:

```vue
<Editor session="demo" defaultFolder=".." />
```

## 🌗 Color scheme

Force VS Code to use a specific color theme:

```vue
<Editor session="demo" colorScheme="dark" />
<Editor session="demo" colorScheme="light" />
```

If omitted, the color scheme automatically follows your Slidev presentation's `colorSchema` setting.

## 🔍 Zoom

VS Code can appear too large inside a slide. Use the `zoom` prop to scale it down:

```vue
<Editor session="demo" :zoom="0.8" />
```

Can also be set globally for all editors in the frontmatter:

```yaml
livecode:
  zoom: 0.8
```

## 🎯 Keyboard navigation guard

Use `disableInitialFocus` to prevent VS Code from stealing keyboard focus when you navigate to a slide — arrow keys keep working for Slidev navigation:

```vue
<Editor session="demo" disableInitialFocus />
```

Focus is held on the slide for 5 seconds after VS Code loads, then released normally. The user can interact with VS Code freely after that.

## ⚡ Preload

Use `preload` to warm up the VS Code session before the user reaches the slide. Slidev mounts adjacent slides in the background, so the session can start while the user is still on the previous slide:

```vue
<Editor session="demo" preload />
```

Combine with `disableInitialFocus` for a seamless experience — the IDE is ready and keyboard navigation still works on slide entry.

## 🔒 Keep the session alive across navigation

By default, navigating away from a slide stops the session. Use `persist` to keep it running:

```vue
<Editor session="demo" persist />
```

The session survives slide changes and resumes instantly when you come back.

## ⚙️ Deck-level config

Set defaults for all editors in your frontmatter:

```yaml
---
addons:
  - livecode
livecode:
  defaultFolder: /path/to/workspace
  defaultPort: 9000
  startTimeout: 30000
  zoom: 0.8
---
```

Per-component props override these values.

## 🧩 `<Editor />` props

| Prop                  | Type                | Default      | Description                                                                     |
| --------------------- | ------------------- | ------------ | ------------------------------------------------------------------------------- |
| `session`             | `string`            | auto         | Unique session identifier. Auto-generated from slide number if omitted.         |
| `defaultFolder`       | `string`            | project root | Workspace folder to open. Absolute or relative to the Slidev root.              |
| `colorScheme`         | `'dark' \| 'light'` | auto         | VS Code color theme. Defaults to Slidev's `colorSchema` if set, otherwise none. |
| `fontSize`            | `number`            | —            | Editor font size. Useful for visibility in large rooms.                         |
| `disableInitialFocus` | `boolean`           | `false`      | Prevent VS Code from stealing keyboard focus on slide entry.                    |
| `hideActivityBar`     | `boolean`           | `false`      | Hide the VS Code activity bar (left icon sidebar).                              |
| `hideMinimap`         | `boolean`           | `false`      | Hide the editor minimap.                                                        |
| `hideStatusBar`       | `boolean`           | `false`      | Hide the VS Code status bar (bottom bar).                                       |
| `height`              | `string`            | `100%`       | CSS height of the editor container.                                             |
| `persist`             | `boolean`           | `false`      | Keep the session alive when navigating away.                                    |
| `preload`             | `boolean`           | `false`      | Start the session while the slide is not yet active (requires Slidev preload).  |
| `port`                | `number`            | auto         | Force a specific port for this session.                                         |
| `startTimeout`        | `number`            | `30000`      | Max startup time in ms before the session is marked as failed.                  |
| `zoom`                | `number`            | `1`          | Scale factor for the VS Code UI (e.g. `0.8` for 80%).                           |

## ⚠️ Static exports

The `<Editor />` component requires Slidev dev mode. In static exports (`slidev build`), it renders a placeholder instead. Plan your demos accordingly.

## 🏷️ Requirements

- `@slidev/client >= 52`
- `coderaft >= 0.0.25`
- `vue >= 3.4`

## Maintainer

Made by [Mickaël Alves](https://mickaelalvs.dev) — [mickaelalvs.dev](https://mickaelalvs.dev)

[![Bluesky](https://img.shields.io/badge/Bluesky-mickaelalvs.dev-0285FF?style=for-the-badge&logo=bluesky&logoColor=white)](https://bsky.app/profile/mickaelalvs.dev)
[![GitHub](https://img.shields.io/badge/GitHub-mickaelalvs-18181b?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mickaelalvs)

## License

[![license](https://img.shields.io/github/license/mickaelalvs/slidev-addon-livecode?style=for-the-badge&labelColor=3da639&color=18181b)](./LICENSE)
