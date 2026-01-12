/**
 * APIRecordsListRankingManager
 *
 * Concrete implementation of ListRankingManager for API Client records.
 * Manages ranking for RecordData objects (API requests and collections).
 */

import { getImmediateChildrenRecords } from "features/apiClient/hooks/useChildren.hook";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
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

  // add a function to generate new ranks for new requests being added to a list
  getRanksForNewApis(context: ApiClientFeatureContext, collectionID: string, newRecords: RecordData[]): string[] {
    const siblings = getImmediateChildrenRecords(context, collectionID);
    return this.getNextRanks(siblings, newRecords);
  }

  /**
   * Generates a rank for a duplicated request
   * Places the duplicated request immediately after the original request
   *
   * @param context - The API client feature context
   * @param originalRecord - The record being duplicated
   * @param collectionId - The collection ID where the record belongs
   * @returns Rank string for the duplicated record
   */
  getRankForDuplicatedApi(context: ApiClientFeatureContext, originalRecord: RecordData, collectionId: string): string {
    const siblings = getImmediateChildrenRecords(context, collectionId);

    // Sort all records to find the correct order
    const sortedRecords = this.sort(siblings);

    // Find the index of the original record
    const originalIndex = sortedRecords.findIndex(
      (rec) => this.getEffectiveRank(rec) === this.getEffectiveRank(originalRecord)
    );

    if (originalIndex === -1) {
      // Original record not found, append at the end
      return this.getNextRanks(siblings, [originalRecord])[0];
    }

    // Get the record after the original (or null if it's the last one)
    const nextRecord = sortedRecords[originalIndex + 1] ?? null;

    // Generate a rank between the original record and the next record
    const ranks = this.getRanksBetweenRecords(nextRecord, originalRecord, [originalRecord]);

    return ranks[0];
  }
}

// Export singleton instance for convenience
export const apiRecordsRankingManager = new APIRecordsListRankingManager();
