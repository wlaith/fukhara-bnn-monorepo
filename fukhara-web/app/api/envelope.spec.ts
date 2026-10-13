import { describe, it, expect } from 'vitest'
import { unwrap } from './envelope'

describe('unwrap', () => {
  it('returns the inner data when present', () => {
    expect(unwrap({ computed_with: ['mobsf'], data: { foo: 1 } })).toEqual({ foo: 1 })
  })

  it('returns null when data is null', () => {
    expect(unwrap({ computed_with: null, data: null })).toBeNull()
  })

  it('returns null when the envelope itself is null or undefined', () => {
    expect(unwrap(null)).toBeNull()
    expect(unwrap(undefined)).toBeNull()
  })
})
