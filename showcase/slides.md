---
addons:
  - livecode
livecode:
  defaultPort: 9000
---

# 🛶 slidev-addon-livecode

Live VS Code IDE sessions in your presentations

---

# 🚀 Basic usage

<div class="h-96 mt-4 rounded-xl overflow-hidden">
  <Editor session="demo" />
</div>

---

# 📂 Specific workspace

<div class="h-96 mt-4 rounded-xl overflow-hidden">
  <Editor session="my-project" defaultFolder="/Users/malves.externe/Projects/addons/slidev-addon-livecode" />
</div>

---

# 🔒 Persistent session

State is preserved when navigating away and back.

<div class="h-80 mt-4 rounded-xl overflow-hidden">
  <Editor session="demo" persist />
</div>

---

# 🪟 Two editors side by side

<div class="grid grid-cols-2 gap-4 h-80 mt-4">
  <div class="rounded-xl overflow-hidden">
    <Editor session="client" defaultFolder="/Users/malves.externe/Projects/addons/slidev-addon-livecode" />
  </div>
  <div class="rounded-xl overflow-hidden">
    <Editor session="server" defaultFolder="/Users/malves.externe/Projects/addons/slidev-addon-liveshell" />
  </div>
</div>

---

# 📐 Custom height

<Editor session="small" height="300px" />
