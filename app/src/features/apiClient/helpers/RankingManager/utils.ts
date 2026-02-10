import { RecordData } from "features/apiClient/helpers/RankingManager/APIRecordsListRankingManager";
import { RQAPI } from "features/apiClient/types";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

import { ApiClientFeatureContext, selectChildRecords } from "features/apiClient/slices";

interface GetRankForDroppedRecordParams {
  context: ApiClientFeatureContext;
  targetRecord: RQAPI.ApiRecord;
  droppedRecord: RQAPI.ApiClientRecord;
  dropPosition: "before" | "after" | null;
}

/**
 * Calculates the rank for a dropped record based on the drop position
 * @param context - API client feature context
 * @param targetRecord - The record where the drop is happening
 * @param droppedRecord - The record being dropped
 * @param dropPosition - Whether dropping before or after the target record
 * @returns The calculated rank for the dropped record
 */
export const getRankForDroppedRecord = ({
  context,
  targetRecord,
  droppedRecord,
  dropPosition,
}: GetRankForDroppedRecordParams): string => {
  const state = context.store.getState();
  const siblings = apiRecordsRankingManager.sort(selectChildRecords(state, targetRecord.collectionId ?? ""));
  console.log("Siblings for target record:", siblings);
  let beforeRecord: RecordData | null = null;
  let afterRecord: RecordData | null = null;
  const recordIndex = siblings.findIndex((sibling) => sibling.id === targetRecord.id);

  if (dropPosition === "before") {
    beforeRecord = siblings[recordIndex - 1] || null;
    afterRecord = targetRecord;
  } else if (dropPosition === "after") {
    afterRecord = siblings[recordIndex + 1] || null;
    beforeRecord = targetRecord;
  }

  const rank =
    apiRecordsRankingManager.getRanksBetweenRecords(beforeRecord, afterRecord, [droppedRecord])[0] ||
    apiRecordsRankingManager.getEffectiveRank(droppedRecord);
  return rank;
};
