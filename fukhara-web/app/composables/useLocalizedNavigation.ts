import type { RouteLocationRaw } from 'vue-router'

export function useLocalizedNavigation() {
  const localePath = useLocalePath()

  return {
    push: (to: RouteLocationRaw) => navigateTo(localePath(to)),
    replace: (to: RouteLocationRaw) => navigateTo(localePath(to), { replace: true }),
  }
}
