import type { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import type { RunHistoryEntry } from "./types";
import { RunStatus } from "../common/runResults/types";

/**
 * Converts a RunResult (with Map iterations) to RunHistoryEntry format (with Array iterations)
 * for persistence in the run history store.
 *
 * @param runResult - The run result with Map-based iterations
 * @param id - The unique identifier for this history entry (typically from Firebase document ID)
 * @returns RunHistoryEntry with array-based iterations
 */
export function convertToRunHistoryEntry(runResult: RunResult, id: string): RunHistoryEntry {
  // Convert Map to Array for persistence
  const iterationsArray = Array.from(runResult.iterations.values());

  return {
    id,
    startTime: runResult.startTime,
    endTime: runResult.endTime,
    runStatus: runResult.runStatus as RunStatus.COMPLETED | RunStatus.CANCELLED,
    iterations: iterationsArray,
  };
}

/**
 * Batch converts multiple RunResults to RunHistoryEntry format.
 *
 * @param results - Array of run results with their IDs
 * @returns Array of RunHistoryEntry objects
 */
export function convertToRunHistoryEntries(results: Array<RunResult & { id: string }>): RunHistoryEntry[] {
  return results.map((result) => convertToRunHistoryEntry(result, result.id));
}
