<script setup lang="ts">
import { computed, inject, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'

import { requestStart, requestStop } from '../composables/useStartRequest'
import { SessionRegistry } from '../composables/useEditorSession'
import { REGISTRY_KEY } from '../setup/main'
import type { EditorDeckConfig, EditorProps, SessionEntry } from '../types'

const props = withDefaults(defineProps<EditorProps>(), {
  defaultFolder: undefined,
  height: '100%',
  persist: false,
  port: undefined,
  session: undefined,
  startTimeout: undefined,
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

const session = shallowRef<SessionEntry | null>(registry.get(sessionId) ?? null)

const isStarting = computed(
  () => session.value?.state === 'IDLE' || session.value?.state === 'STARTING',
)
const hasFailed = computed(() => session.value?.state === 'ERROR')

const resolvedFolder = computed(() => props.defaultFolder ?? deckConfig.value?.defaultFolder ?? '')

const resolvedTimeout = computed(() => props.startTimeout ?? deckConfig.value?.startTimeout)

async function start(): Promise<void> {
  const entry = registry!.create(sessionId)
  session.value = entry
  registry!.setStarting(sessionId)

  try {
    const url = await requestStart(
      {
        defaultFolder: resolvedFolder.value,
        defaultPort: deckConfig.value?.defaultPort,
        port: props.port,
        session: sessionId,
        startTimeout: resolvedTimeout.value,
      },
      resolvedTimeout.value,
    )
    if (entry.state === 'DESTROYED') return
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

watch(
  isActive,
  async (active) => {
    if (active) {
      const existing = registry!.get(sessionId)
      if (existing) {
        session.value = existing
        return
      }
      await start()
    } else if (!props.persist) {
      requestStop(sessionId)
      registry!.teardown(sessionId)
      session.value = null
    }
  },
  { flush: 'post', immediate: true },
)

onBeforeUnmount(() => {
  if (!props.persist) {
    requestStop(sessionId)
    registry!.teardown(sessionId)
  }
})
</script>

<template>
  <div class="slidev-editor" :style="{ height }">
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
