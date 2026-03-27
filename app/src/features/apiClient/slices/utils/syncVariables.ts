import type { EnvironmentVariables } from "backend/environment/types";

/**
 * Mirrors the old Zustand `resetSyncValues` semantics:
 * - Take the incoming synced variables as the source of truth for keys (adds/removes)
 * - Preserve existing `localValue` for keys that already exist locally
 */
export function mergeSyncedVariablesPreservingLocalValue(
  current: EnvironmentVariables,
  incoming: EnvironmentVariables
): EnvironmentVariables {
  const merged: EnvironmentVariables = {};

  for (const key in incoming) {
    const next = incoming[key];
    if (!next) continue;

    const prev = current[key];
    merged[key] = prev ? { ...next, localValue: prev.localValue } : next;
  }

  return merged;
}
