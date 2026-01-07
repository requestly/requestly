/**
 * APIRecordsListRankingManager
 *
 * Concrete implementation of ListRankingManager for API Client records.
 * Manages ranking for RecordData objects (API requests and collections).
 */

import { ListRankingManager } from "modules/ranking";

type BaseData = {
  name?: string;
  createdTs?: number;
  rank?: string;
};

type RecordData = BaseData & { [key: string]: any };

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
}

// Export singleton instance for convenience
export const apiRecordsRankingManager = new APIRecordsListRankingManager();
