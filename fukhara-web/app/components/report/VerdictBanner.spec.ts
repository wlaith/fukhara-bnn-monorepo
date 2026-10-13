import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VerdictBanner from './VerdictBanner.vue'
import Tag from '../ui/Tag.vue'
import i18n from '~/test-utils/i18n'

describe('VerdictBanner', () => {
  it('renders verdict, severity, reason, and response', () => {
    const wrapper = mount(VerdictBanner, {
      props: {
        verdict: 'Malicious',
        severity: 'High',
        reason: 'Talks to suspicious domains',
        response: 'Delete the sample immediately',
      },
    })
    expect(wrapper.text()).toContain('Malicious')
    expect(wrapper.text()).toContain('High')
    expect(wrapper.text()).toContain('Talks to suspicious domains')
    expect(wrapper.text()).toContain('Delete the sample immediately')
  })

  it('renders the section labels', () => {
    const wrapper = mount(VerdictBanner, {
      props: { verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' },
    })
    expect(wrapper.text()).toContain('Reason')
    expect(wrapper.text()).toContain('Recommended Response')
  })

  it('renders red styling for High severity', () => {
    const wrapper = mount(VerdictBanner, {
      props: { verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' },
    })
    expect(wrapper.find('.verdict-banner__headline--red').exists()).toBe(true)
    expect(wrapper.findComponent(Tag).props('kind')).toBe('red')
  })

  it('renders green styling for Low severity', () => {
    const wrapper = mount(VerdictBanner, {
      props: { verdict: 'Benign', severity: 'Low', reason: 'r', response: 'r2' },
    })
    expect(wrapper.find('.verdict-banner__headline--green').exists()).toBe(true)
    expect(wrapper.findComponent(Tag).props('kind')).toBe('green')
  })

  it('renders Arabic section labels and severity tag when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const wrapper = mount(VerdictBanner, {
      props: { verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' },
    })
    expect(wrapper.text()).toContain('السبب')
    expect(wrapper.text()).toContain('الإجراء الموصى به')
    expect(wrapper.text()).toContain('خطورة عالية')
    i18n.global.locale.value = 'en'
  })

  it('falls back to the raw value for an unrecognized severity string', () => {
    const wrapper = mount(VerdictBanner, {
      props: { verdict: 'Unknown', severity: 'Critical', reason: 'r', response: 'r2' },
    })
    expect(wrapper.text()).toContain('Critical Severity')
  })
})
