<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, shallowRef, useAttrs, useTemplateRef, watch } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'

import { requestStart, requestStop } from '../composables/useStartRequest'
import { SessionRegistry } from '../composables/useEditorSession'
import { REGISTRY_KEY } from '../setup/main'
import type { EditorDeckConfig, EditorProps, SessionEntry } from '../types'

const props = withDefaults(defineProps<EditorProps>(), {
  disableInitialFocus: false,
  height: '100%',
  hideActivityBar: false,
  hideMinimap: false,
  hideStatusBar: false,
  persist: false,
  preload: false,
  zoom: 1,
})

const registry = inject<SessionRegistry>(REGISTRY_KEY)
if (!registry) {
  throw new Error(
    '[livecode] Session registry not found. Is the addon declared in your frontmatter?',
  )
}

const { $slidev } = useSlideContext()
const deckConfig = computed<EditorDeckConfig | undefined>(
  () => ($slidev.configs as { livecode?: EditorDeckConfig }).livecode,
)

const { currentPage } = useNav()

const sessionId = props.session ?? `livecode-${currentPage.value}-${props.port ?? 'default'}`

const attrs = useAttrs()
const isDisableInitialFocus = computed(() =>
  !!props.disableInitialFocus || 'disableInitialFocus' in attrs || 'disable-initial-focus' in attrs,
)
const isPreload = computed(() => !!props.preload || 'preload' in attrs)

const session = shallowRef<SessionEntry | null>(registry.get(sessionId) ?? null)

const isStarting = computed(
  () => session.value?.state === 'IDLE' || session.value?.state === 'STARTING',
)
const hasFailed = computed(() => session.value?.state === 'ERROR')

const resolvedFolder = computed(() => props.defaultFolder ?? deckConfig.value?.defaultFolder ?? '')

const slidevColorSchema = computed(() => {
  const schema = ($slidev.configs as { colorSchema?: string }).colorSchema
  return schema === 'light' || schema === 'dark' ? schema : undefined
})
const resolvedColorScheme = computed(() => props.colorScheme ?? slidevColorSchema.value)
const resolvedZoom = computed(() => props.zoom ?? deckConfig.value?.zoom ?? 1)

const resolvedTimeout = computed(() => props.startTimeout ?? deckConfig.value?.startTimeout)

async function start(): Promise<void> {
  const entry = registry!.create(sessionId)
  session.value = entry
  registry!.setStarting(sessionId)

  try {
    const url = await requestStart(
      {
        colorScheme: resolvedColorScheme.value,
        defaultFolder: resolvedFolder.value,
        defaultPort: deckConfig.value?.defaultPort,
        fontSize: props.fontSize,
        hideActivityBar: props.hideActivityBar,
        hideMinimap: props.hideMinimap,
        hideStatusBar: props.hideStatusBar,
        port: props.port,
        session: sessionId,
        startTimeout: resolvedTimeout.value,
      },
      resolvedTimeout.value,
    )
    if (entry.state === 'DESTROYED') return
    if (isDisableInitialFocus.value) startGuard()
    registry!.setRunning(sessionId, url)
  } catch (err) {
    if (entry.state !== 'DESTROYED') registry!.setError(sessionId)
    console.error(err)
  }
}

async function retry(): Promise<void> {
  requestStop(sessionId)
  registry!.teardown(sessionId)
  await start()
}

const isActive = useIsSlideActive()

let hasBeenActive = false

watch(
  isActive,
  async (active) => {
    if (active) {
      hasBeenActive = true
      const existing = registry!.get(sessionId)
      if (existing) {
        session.value = existing
        return
      }
      await start()
    } else if (isPreload.value && !hasBeenActive && !registry!.get(sessionId)) {
      await start()
    } else if (!props.persist && hasBeenActive) {
      requestStop(sessionId)
      registry!.teardown(sessionId)
      session.value = null
    }
  },
  { flush: 'post', immediate: true },
)

const containerRef = useTemplateRef<HTMLElement>('container')
const isGuarding = ref(false)
let guardTimer: ReturnType<typeof setTimeout> | null = null

function handleWindowBlur() {
  if (!isGuarding.value) return
  setTimeout(() => containerRef.value?.focus(), 0)
}

function startGuard() {
  if (guardTimer) clearTimeout(guardTimer)
  isGuarding.value = true
  containerRef.value?.focus()
  window.addEventListener('blur', handleWindowBlur)
  guardTimer = setTimeout(() => {
    isGuarding.value = false
    window.removeEventListener('blur', handleWindowBlur)
    guardTimer = null
  }, 5000)
}

function stopGuard() {
  window.removeEventListener('blur', handleWindowBlur)
  if (guardTimer) { clearTimeout(guardTimer); guardTimer = null }
  isGuarding.value = false
}

watch(isActive, (active) => {
  if (!active || !isDisableInitialFocus.value) { stopGuard(); return }
  if (session.value?.state === 'RUNNING') startGuard()
})

onBeforeUnmount(() => {
  stopGuard()
  if (!props.persist) {
    requestStop(sessionId)
    registry!.teardown(sessionId)
  }
})
</script>

<template>
  <div ref="container" class="slidev-editor" :style="{ height }" tabindex="-1">
    <template v-if="!$slidev?.nav">
      <div class="slidev-editor-overlay">
        <div class="slidev-editor-overlay-title">IDE not available</div>
        <div>Live IDE requires Slidev dev mode — not supported in static exports.</div>
      </div>
    </template>

    <template v-else>
      <iframe
        v-if="session?.state === 'RUNNING' && session.url"
        :src="session.url"
        :style="resolvedZoom !== 1 ? { zoom: String(resolvedZoom) } : undefined"
        class="slidev-editor-frame"
        allow="clipboard-read; clipboard-write"
      />

      <div v-else-if="isStarting" class="slidev-editor-overlay">
        <div class="slidev-editor-spinner" />
        <div>Starting VS Code…</div>
      </div>

      <div v-else-if="hasFailed" class="slidev-editor-overlay">
        <div class="slidev-editor-overlay-title">IDE Unavailable</div>
        <div>
          Failed to start editor for session <code>{{ sessionId }}</code>
        </div>
        <div class="slidev-editor-overlay-detail">
          Make sure coderaft is installed: <code>pnpm add coderaft</code>
        </div>
        <button class="slidev-editor-overlay-retry" @click="retry">Retry</button>
      </div>
    </template>
  </div>
</template>
