/**
 * APIRecordsListRankingManager
 *
 * Concrete implementation of ListRankingManager for API Client records.
 * Manages ranking for RecordMetadata objects (API requests and collections).
 */

import { ListRankingManager } from "utils/ranking";
import { RQAPI } from "features/apiClient/types";

type RecordMetadata = RQAPI.RecordMetadata;

export class APIRecordsListRankingManager extends ListRankingManager<RecordMetadata> {
  /**
   * Retrieves the saved rank from a record
   * Returns null if rank is not set
   */
  getSavedRank(record: RecordMetadata): string | null {
    return record.rank ?? null;
  }

  /**
   * Generates a deterministic rank based on record properties
   * Format: "a" + alphanumeric name prefix (5 chars) + createdTs
   * This ensures consistent ordering for records without explicit ranks
   */
  getGeneratedRank(record: RecordMetadata): string {
    // Extract alphanumeric characters from name, lowercase, max 5 chars
    const namePart = record.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 5)
      .padEnd(5, "0"); // Pad with zeros if less than 5 chars

    // Combine prefix + name + timestamp for deterministic ordering
    return `a${namePart}${record.createdTs}1`;
  }
}

// Export singleton instance for convenience
export const apiRecordsRankingManager = new APIRecordsListRankingManager();
