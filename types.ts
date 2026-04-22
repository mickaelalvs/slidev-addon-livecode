export type SessionState = 'IDLE' | 'STARTING' | 'RUNNING' | 'ERROR' | 'DESTROYED'

export interface EditorProps {
  defaultFolder?: string
  openFile?: string
  height?: string
  persist?: boolean
  port?: number
  session?: string
  startTimeout?: number
  zoom?: number
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
  zoom?: number
}

export interface StartRequest {
  defaultFolder: string
  openFile?: string
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
