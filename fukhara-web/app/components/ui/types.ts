import type { TagKind } from '../../domain/severity'

export interface TagSpec {
  label: string
  kind: TagKind
}

export interface ContainedListRow {
  id: string
  title: string
  meta?: string
  tags?: TagSpec[]
  mono?: boolean
}

export interface KeyValueRow {
  id: string
  label: string
  value?: string
  mono?: boolean
  scanner?: boolean
  copy?: boolean
  href?: string
  tags?: TagSpec[]
}
