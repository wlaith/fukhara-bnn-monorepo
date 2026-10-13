import { describe, it, expect } from 'vitest'
import { apiConfig } from './config'

describe('apiConfig', () => {
  it('defaults to mock data', () => {
    expect(apiConfig()).toEqual({ useMock: true })
  })
})
