// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { User } from '$lib/types'
import type { AxiosInstance } from 'axios'

declare global {
  namespace App {
      interface Locals {
        user?: User
        socketAuth?: string
        axios: AxiosInstance
      }
      // interface PageData {}
      // interface Error {}
      // interface Platform {}
  }
}
