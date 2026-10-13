export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(description: string, request: () => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch (err) {
    const status = (err as { statusCode?: number } | null)?.statusCode
    if (status === undefined) throw err
    throw new ApiError(status, `${description} failed with ${status}`)
  }
}
