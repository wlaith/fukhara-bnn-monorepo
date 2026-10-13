export interface Envelope<T> {
  computed_with: string[] | null
  data: T | null
}

export function unwrap<T>(envelope: Envelope<T> | null | undefined): T | null {
  return envelope?.data ?? null
}
