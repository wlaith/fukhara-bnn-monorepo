export function apiConfig(): { useMock: boolean } {
  const { public: config } = useRuntimeConfig()
  return { useMock: config.useMock }
}
