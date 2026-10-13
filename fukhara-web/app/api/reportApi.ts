import { apiRequest } from './client'
import { apiConfig } from './config'
import { unwrap, type Envelope } from './envelope'
import { verdictFixture } from './mocks/verdict'
import rawSample from './mocks/fixtures/sample-report-raw.json'
import type { components } from './schema'

// schema.ts marks section fields optional; Envelope<T> requires them. unwrap() is
// runtime-safe for both, so narrow the type here rather than editing either source.
function unwrapSection<T>(
  section: { computed_with?: string[] | null; data?: T | null } | null | undefined,
): T | null {
  return unwrap(section as Envelope<T> | null | undefined)
}

// The raw fixture nests these one level deeper than the real API (which returns them flat).
function unnest(value: unknown, key: string): unknown {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && key in value
    ? (value as Record<string, unknown>)[key]
    : value
}

type VerdictResponse = components['schemas']['VerdictResponse']

export interface AnalyzeResult {
  id: string
  status: string
}

export async function analyzeApk(file: File): Promise<AnalyzeResult> {
  if (apiConfig().useMock) {
    return { id: rawSample.fingerprints['checksums[mobsf]'].sha256, status: 'success' }
  }
  const body = new FormData()
  body.append('file', file)
  const res = await apiRequest('POST /api/analyze/', () =>
    $fukhara('/api/analyze/', { method: 'POST', body: body as never }),
  )
  return { id: res.id ?? '', status: res.status ?? '' }
}

export interface AnalysisStatus {
  status: 'pending' | 'completed' | 'failed'
  toolsDone: number
  toolsTotal: number
}

export async function getAnalysisStatus(id: string): Promise<AnalysisStatus> {
  if (apiConfig().useMock) return { status: 'completed', toolsDone: 1, toolsTotal: 1 }
  const res = await apiRequest(`GET /api/report/${id}/status/`, () =>
    $fukhara('/api/report/{id}/status/', { path: { id } }),
  )
  return {
    status: res.status as AnalysisStatus['status'],
    toolsDone: res.tools_done?.length ?? 0,
    toolsTotal: res.tools_total,
  }
}

export async function getVerdict(id: string) {
  if (apiConfig().useMock) return verdictFixture
  const res = await apiRequest(`GET /api/report/${id}/verdict/`, () =>
    $fukhara('/api/report/{id}/verdict/', { path: { id } }),
  )
  return unwrapSection<VerdictResponse>(res.verdict)
}

export async function getFingerprints(id: string) {
  if (apiConfig().useMock) {
    return {
      checksums: rawSample.fingerprints['checksums[mobsf]'],
      identifiers: rawSample.fingerprints['identifiers[apkid]'],
      fuzzy_hashes: rawSample.fingerprints["fuzzy_hashes[['ssdeep']]"],
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/fingerprints/`, () =>
    $fukhara('/api/report/{id}/fingerprints/', { path: { id } }),
  )
  return {
    checksums: unwrapSection(res.checksums),
    identifiers: unwrapSection(res.identifiers),
    fuzzy_hashes: unwrapSection(res.fuzzy_hashes),
  }
}

export async function getThreatIntelligence(id: string) {
  if (apiConfig().useMock) {
    return {
      sample_timeline: rawSample.threat_intelligence["sample_timeline[['fukhara', 'virustotal']]"],
      yara_matches: rawSample.threat_intelligence['yara_matches[yara]'],
      av_detections: rawSample.threat_intelligence['av-detections'],
      // Real API shape when neither service knows the sample.
      third_party_apps: { virustotal: '', malwarebazaar: '' },
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/threat-intelligence/`, () =>
    $fukhara('/api/report/{id}/threat-intelligence/', { path: { id } }),
  )
  return {
    sample_timeline: unwrapSection(res.sample_timeline),
    yara_matches: unwrapSection(res.yara_matches),
    av_detections: unwrapSection(res['av-detections']),
    third_party_apps: unwrapSection(res['third-party-apps']),
  }
}

export async function getAppAnalysis(id: string) {
  if (apiConfig().useMock) {
    return {
      apk_details: rawSample.apk_analysis["apk_details[['mobsf', 'apk_info']]"],
      certificate_details: rawSample.apk_analysis['certificate_details[apk_info]'],
      manifest_analysis: rawSample.apk_analysis['manifest_analysis[mobsf]'],
      activities: {
        main_activity: unnest(rawSample.apk_analysis['acitivities[mobsf]'].main_activity, 'main_activity') as string,
        all_activities: unnest(rawSample.apk_analysis['acitivities[mobsf]'].all_activities, 'all_activities') as string[],
      },
      receivers: rawSample.apk_analysis['receivers[mobsf]'],
      services: rawSample.apk_analysis['services[mobsf]'],
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/app/`, () =>
    $fukhara('/api/report/{id}/app/', { path: { id } }),
  )
  return {
    apk_details: unwrapSection(res.apk_details),
    certificate_details: unwrapSection(res.certificate_details),
    manifest_analysis: unwrapSection(res.manifest_analysis),
    activities: unwrapSection(res.acitivities),
    receivers: unwrapSection(res.receivers),
    services: unwrapSection(res.services),
  }
}

export async function getCodeAnalysis(id: string) {
  if (apiConfig().useMock) {
    return {
      niap_analysis: rawSample.code_analysis['niap_analysis[mobsf]'],
      code_vulnerabilities: rawSample.code_analysis['code_vulnerabilties[mobsf]'],
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/code/`, () =>
    $fukhara('/api/report/{id}/code/', { path: { id } }),
  )
  return {
    niap_analysis: unwrapSection(res.niap_analysis),
    code_vulnerabilities: unwrapSection(res.code_vulnerabilties),
  }
}

export async function getBehaviorAnalysis(id: string) {
  if (apiConfig().useMock) {
    return {
      threats: rawSample.behavior_analysis['threats[quark_engine]'],
      permissions: rawSample.behavior_analysis['permissions[mobsf]'],
      detailed_permissions: rawSample.behavior_analysis['detailed_permissions[mobsf]'],
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/behavior/`, () =>
    $fukhara('/api/report/{id}/behavior/', { path: { id } }),
  )
  return {
    threats: unwrapSection(res.threats),
    permissions: unwrapSection(res.permissions),
    detailed_permissions: unwrapSection(res.detailed_permissions),
  }
}

export async function getNetworkAnalysis(id: string) {
  if (apiConfig().useMock) {
    return {
      domains: rawSample.network_analysis['domains[mobsf]'],
      urls: rawSample.network_analysis['urls[mobsf]'],
    }
  }
  const res = await apiRequest(`GET /api/report/${id}/network/`, () =>
    $fukhara('/api/report/{id}/network/', { path: { id } }),
  )
  return {
    domains: unwrapSection(res.domains),
    urls: unwrapSection(res.urls),
  }
}
