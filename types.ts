export type SessionState = 'IDLE' | 'STARTING' | 'RUNNING' | 'ERROR' | 'DESTROYED'

export interface EditorProps {
  defaultFolder?: string
  height?: string
  persist?: boolean
  port?: number
  session?: string
  startTimeout?: number
}

export interface SessionEntry {
  id: string
  state: SessionState
  url: string | null
}

export interface EditorDeckConfig {
  defaultFolder?: string
  defaultPort?: number
  startTimeout?: number
}

export interface StartRequest {
  defaultFolder: string
  defaultPort?: number
  port?: number
  session: string
  startTimeout?: number
}

export interface StartedEvent {
  error?: string
  session: string
  state: 'running' | 'error'
  url: string
}
