import type { Translate } from '~/domain/translate'
import i18n from './i18n'

export function withTestT<A extends unknown[], R>(fn: (...args: [...A, Translate]) => R) {
  return (...args: A): R => fn(...args, i18n.global.t)
}
