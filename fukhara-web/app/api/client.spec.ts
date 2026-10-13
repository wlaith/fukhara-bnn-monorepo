import { describe, it, expect } from 'vitest'
import { apiRequest, ApiError } from './client'

describe('apiRequest', () => {
  it('returns the response on success', async () => {
    const result = await apiRequest('GET /api/reports/', async () => ({ hello: 'world' }))
    expect(result).toEqual({ hello: 'world' })
  })

  it('turns an HTTP error into an ApiError with its status', async () => {
    const fetchError = Object.assign(new Error('Not Found'), { statusCode: 404 })
    const request = apiRequest('GET /api/report/missing/status/', () => Promise.reject(fetchError))
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 404 })
  })

  it('rethrows errors that carry no HTTP status', async () => {
    const networkError = new TypeError('fetch failed')
    await expect(apiRequest('GET /api/reports/', () => Promise.reject(networkError))).rejects.toBe(
      networkError,
    )
  })
})
