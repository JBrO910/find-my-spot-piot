import {writable} from 'svelte/store'

export interface Message {
  severity: 'error' | 'warn' | 'success',
  duration: number
  message: string
  description: string
  isGlobal?: boolean
}

export const globalMessageState = writable<Message | undefined>(undefined)
