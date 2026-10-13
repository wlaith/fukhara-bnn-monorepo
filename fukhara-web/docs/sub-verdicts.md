# Sub-Verdict Calculation Rules

These are the client-side rules behind the 6 category summary cards on the
report page. None of this comes from the API — `GET /api/report/{id}/verdict/`
only returns the *overall* verdict (malicious/severity/reason/response). The
per-category numbers below are derived in the frontend from each section's raw
data. They are v1 heuristics — reasonable, documented, and easy to change in
one place (`src/domain/subVerdicts.ts`) as real-world samples reveal better
rules.

Severity color mapping used throughout (`src/domain/severity.ts`):
`high` → red, `warning` → purple, `info` → gray, `good` → green.

## Code Analysis
Source: `code_vulnerabilties` (map of category → `{files, metadata}`).

- Headline: count of categories where `metadata.severity` is `high` or
  `warning` → **"N Vulnerabilities"**.
- Tags: up to two chips, one per severity present among `{high, warning}`,
  formatted **"N High"** / **"N Warning"**, highest severity first. If neither
  is present, show a single **"No Issues Found"** tag instead.

## Behavior Analysis
Source: `permissions` (map of permission name → `{status, info, description}`).

- Headline: count where `status == "dangerous"` → **"N Dangerous"**.
- Tags: **"N Moderate"** (`status == "normal"`), **"N Unclassified"**
  (`status == "unknown"`). "Unclassified" is used instead of "Safe" — an
  unknown-status permission has not been verified safe, and labeling it as
  such would be misleading.

## App Information
Source: `manifest_analysis` (list of `{rule, title, severity, description, component}`).

- Headline: count where `severity == "high"` → **"N Critical"**.
- Tags: **"N Moderate"** (`severity == "warning"`), **"N Low"**
  (`severity == "info"`). Omit a tag if its count is 0.

## Threat Intelligence
Sources: `yara_matches.matches` (list) and `av-detections` (map/list of
engine → count, or empty).

- Let `yaraCount` = total number of rule matches across all `matches[].rules`.
- Let `avCount` = number of AV engines present in `av-detections`.
- Headline: `yaraCount + avCount == 0` → **"No Detections"**; otherwise
  **"Flagged N×"** where N = `yaraCount + avCount`.
- Tags: **"N YARA Matches"** / **"No YARA Matches"**, and **"N AV Detections"**
  / **"Not Detected by AV"**.

## Network
Source: `domains` (map of domain → `{bad, geolocation, ofac}`).

- Headline: count where `bad != "no"` → 0 → **"No Bad Domains"**, else
  **"N Bad Domains"**.
- Tags: if any domain has `ofac == true`, add **"N OFAC-Listed"**.

## Fingerprints
Source: `identifiers[apkid].files[].matches` (per-file map of category →
list of findings), categories: `manipulator`, `anti_debug`, `anti_vm`,
`compiler`, `obfuscator`, `protector`.

- Only `manipulator`, `anti_debug`, `anti_vm`, `obfuscator`, `protector` count
  as "flagged" — `compiler` is informational, not suspicious, and is excluded.
- Headline: count of distinct `(category, value)` pairs found across all files
  in the flagged category set → **"N Identifiers Flagged"**.
- Tags: one chip per distinct flagged pair, formatted **"Category: Value"**
  (e.g. "Obfuscator: Alipay"), capped to the first 2 by discovery order — the
  full list is visible in the Fingerprints tab itself.

## Control Flow
No card — this section isn't part of the 6-card summary grid (Figma didn't
include it, and there's no data to summarize yet; see the main design spec,
§4 and §11).
