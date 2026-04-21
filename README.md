# 🛶 slidev-addon-livecode

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

```md
---
addons:
  - livecode
---

# My slide

<Editor session="demo" />
```

That's it. When you navigate to the slide, a VS Code instance starts automatically and loads inside the slide.

## 📂 Open a specific workspace

```md
<Editor session="demo" defaultFolder="/path/to/your/project" />
```

## 🪟 Two editors side by side

```md
<div class="grid grid-cols-2 gap-4 h-80">
  <Editor session="client" defaultFolder="/path/to/client" />
  <Editor session="server" defaultFolder="/path/to/server" />
</div>
```

Each session runs on its own port. They don't share state.

## 🔒 Keep the session alive across navigation

By default, navigating away from a slide stops the session. Use `persist` to keep it running:

```md
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
---
```

Per-component props override these values.

## 🧩 `<Editor />` props

| Prop            | Type      | Default      | Description                                                             |
| --------------- | --------- | ------------ | ----------------------------------------------------------------------- |
| `session`       | `string`  | auto         | Unique session identifier. Auto-generated from slide number if omitted. |
| `defaultFolder` | `string`  | project root | Workspace folder to open.                                               |
| `height`        | `string`  | `100%`       | CSS height of the editor container.                                     |
| `persist`       | `boolean` | `false`      | Keep the session alive when navigating away.                            |
| `port`          | `number`  | auto         | Force a specific port for this session.                                 |
| `startTimeout`  | `number`  | `30000`      | Max startup time in ms before the session is marked as failed.          |

## ⚠️ Static exports

The `<Editor />` component requires Slidev dev mode. In static exports (`slidev build`), it renders a placeholder instead. Plan your demos accordingly.

## Requirements

- `@slidev/client >= 52`
- `coderaft >= 0.0.25`
- `vue >= 3.4`

## License

MIT
