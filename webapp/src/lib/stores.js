import {writable} from 'svelte/store'

export const globalSearchState = writable({term: '', searching: false, bouncing: false})
