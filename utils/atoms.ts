import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'

export const pageVariablesAtomFamily = atomFamily((_pageId: string) =>
  atom<Record<string, unknown>>({}),
)

