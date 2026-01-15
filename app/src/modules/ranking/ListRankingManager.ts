/**
 * ListRankingManager
 *
 * Abstract base class for managing lexicographic ranking of list items.
 * Provides deterministic ordering with optional explicit rank property.
 */

import { generateNKeysBetween } from "fractional-indexing";
import * as Sentry from "@sentry/react";

export abstract class ListRankingManager<T> {
  /**
   * Abstract method to retrieve the saved rank from a record
   * Must be implemented by derived classes
   */
  abstract getSavedRank(record: T): string | null;

  /**
   * Abstract method to generate a deterministic rank for a record
   * Used as fallback when saved rank is not available
   * Must be implemented by derived classes
   */
  abstract getGeneratedRank(record: T): string;

  /**
   * Returns the effective rank of a record
   * Uses saved rank if available, otherwise generates a deterministic rank
   */
  getEffectiveRank(record: T): string {
    const savedRank = this.getSavedRank(record);
    if (savedRank) {
      return savedRank;
    }
    return this.getGeneratedRank(record);
  }

  /**
   * Compares two ranks lexicographically
   * Returns -1 if aRank < bRank, 0 if equal, 1 if aRank > bRank
   */
  compareFn(aRank: string, bRank: string): number {
    if (aRank < bRank) return -1;
    if (aRank > bRank) return 1;
    return 0;
  }

  /**
   * Sorts records based on their effective ranks
   * Returns a new sorted array without mutating the original
   */
  sort(records: T[]): T[] {
    return [...records].sort((a, b) => {
      const aRank = this.getEffectiveRank(a);
      const bRank = this.getEffectiveRank(b);
      return this.compareFn(aRank, bRank);
    });
  }

  /**
   * Generates rank(s) between two records
   *
   * @param beforeRecord - The record before the target position (if before is null, means -infinity)
   * @param afterRecord - The record after the target position (if after is null, means infinity)
   * @param records - Array of records to generate ranks for
   * @returns Single rank string or array of rank strings
   */
  getRanksBetweenRecords(beforeRecord: T | null, afterRecord: T | null, records: T[]): string[] {
    const count = records.length;

    if (count === 0) {
      return [];
    }

    // If both before and after are null (empty list), use generated ranks
    if (beforeRecord === null && afterRecord === null) {
      // For multiple records, return their generated ranks
      return records.map((record) => this.getEffectiveRank(record));
    }

    // Get the rank values for before and after
    const beforeRank = beforeRecord ? this.getEffectiveRank(beforeRecord) : null;
    const afterRank = afterRecord ? this.getEffectiveRank(afterRecord) : null;

    const newRanks = [];

    try {
      newRanks.push(...generateNKeysBetween(beforeRank, afterRank, count));
    } catch (e1) {
      Sentry.captureException(e1, {
        extra: {
          beforeRank,
          afterRank,
          count,
        },
      });

      // Fallback to original rank so that undefined ranks are not saved in DB
      records.forEach((record) => newRanks.push(this.getEffectiveRank(record)));
    }
    // Return the array of new ranks
    return newRanks;
  }

  /**
   * Generates ranks for new records to be appended after existing records
   *
   * @param existingRecords - Array of existing records in the list
   * @param newRecords - Array of new records to generate ranks for
   * @returns Array of rank strings for the new records
   */
  getNextRanks(existingRecords: T[], newRecords: T[]): string[] {
    if (newRecords.length === 0) {
      return [];
    }

    // Sort existing records to find the correct order
    const sortedRecords = this.sort(existingRecords);

    // Get the last record from sorted list, null if none
    const lastRecord = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : null;

    // Generate ranks after the last record (after = null means append at end)
    const ranks = this.getRanksBetweenRecords(lastRecord, null, newRecords);

    // Ensure we always return an array
    return ranks;
  }
}
