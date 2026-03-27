/**
 * APIRecordsListRankingManager
 *
 * Concrete implementation of ListRankingManager for API Client records.
 * Manages ranking for RecordData objects (API requests and collections).
 */

import { ApiClientFeatureContext, selectChildRecords } from "features/apiClient/slices";
import { ListRankingManager } from "modules/ranking";

type BaseData = {
  name?: string;
  createdTs?: number;
  rank?: string;
};

export type RecordData = BaseData & { [key: string]: any };

export class APIRecordsListRankingManager extends ListRankingManager<RecordData> {
  /**
   * Retrieves the saved rank from a record
   * Returns null if rank is not set
   */
  getSavedRank(record: RecordData): string | null {
    return record.rank ?? null;
  }

  /**
   * Generates a deterministic rank based on record properties
   * Format: "a" + alphanumeric name prefix (5 chars) + createdTs
   * This ensures consistent ordering for records without explicit ranks
   */
  getGeneratedRank(record: RecordData): string {
    // Extract alphanumeric characters from name, lowercase, max 5 chars
    const name = record.name ?? "Untitled request";

    const namePrefix = name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 5)
      .padEnd(5, "0"); // Pad with zeros if less than 5 chars

    const ts = record.createdTs ?? Date.now();
    // Combine prefix + name + timestamp for deterministic ordering
    // (fractional indexing does not allow first character to be a digit and last character to be a zero)
    return `a${namePrefix}${ts}1`;
  }

  /**
   * Generates ranks for new records being added under a parent (collection or request).
   * @param parentId - collectionId for API records/collections, parentRequestId for examples
   */
  getRanksForNewApiRecords(context: ApiClientFeatureContext, parentId: string, newRecords: RecordData[]): string[] {
    const state = context.store.getState();
    const siblings = selectChildRecords(state, parentId);
    return this.getNextRanks(siblings, newRecords);
  }

  /**
   * Generates a rank for a duplicated record, placed immediately after the original.
   * Works for both API records (pass collectionId) and examples (pass parentRequestId).
   *
   * @param context - The API client feature context
   * @param originalRecord - The record being duplicated
   * @param parentId - collectionId for API records/collections, parentRequestId for examples
   * @returns Rank string for the duplicated record
   */
  getRankForDuplicatedRecord(context: ApiClientFeatureContext, originalRecord: RecordData, parentId: string): string {
    const state = context.store.getState();
    const siblings = selectChildRecords(state, parentId);
    const sortedRecords = this.sort(siblings);
    const originalIndex = sortedRecords.findIndex((rec) => rec.id === originalRecord.id);

    if (originalIndex === -1) {
      return this.getNextRanks(siblings, [originalRecord])[0] ?? this.getEffectiveRank(originalRecord);
    }

    const nextRecord = sortedRecords[originalIndex + 1] ?? null;
    const ranks = this.getRanksBetweenRecords(originalRecord, nextRecord, [originalRecord]);
    return ranks[0] ?? this.getEffectiveRank(originalRecord);
  }
}

// Export singleton instance for convenience
export const apiRecordsRankingManager = new APIRecordsListRankingManager();
