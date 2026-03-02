import { RecordData } from "features/apiClient/helpers/RankingManager/APIRecordsListRankingManager";
import { RQAPI } from "features/apiClient/types";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

import { ApiClientFeatureContext, selectChildRecords } from "features/apiClient/slices";

interface GetRankForDroppedItemParams {
  context: ApiClientFeatureContext;
  parentId: string;
  targetItem: RQAPI.ApiClientRecord;
  droppedItem: RQAPI.ApiClientRecord;
  dropPosition: "before" | "after" | null;
}

const getRankForDroppedItem = ({
  context,
  parentId,
  targetItem,
  droppedItem,
  dropPosition,
}: GetRankForDroppedItemParams): string => {
  const state = context.store.getState();
  const siblings = apiRecordsRankingManager.sort(selectChildRecords(state, parentId));
  let beforeRecord: RecordData | null = null;
  let afterRecord: RecordData | null = null;
  const recordIndex = siblings.findIndex((sibling) => sibling.id === targetItem.id);

  if (dropPosition === "before") {
    beforeRecord = siblings[recordIndex - 1] || null;
    afterRecord = targetItem;
  } else if (dropPosition === "after") {
    afterRecord = siblings[recordIndex + 1] || null;
    beforeRecord = targetItem;
  }

  return (
    apiRecordsRankingManager.getRanksBetweenRecords(beforeRecord, afterRecord, [droppedItem])[0] ||
    apiRecordsRankingManager.getEffectiveRank(droppedItem)
  );
};

export const getRankForDroppedRecord = ({
  context,
  targetRecord,
  droppedRecord,
  dropPosition,
}: {
  context: ApiClientFeatureContext;
  targetRecord: RQAPI.ApiRecord;
  droppedRecord: RQAPI.ApiClientRecord;
  dropPosition: "before" | "after" | null;
}): string =>
  getRankForDroppedItem({
    context,
    parentId: targetRecord.collectionId ?? "",
    targetItem: targetRecord,
    droppedItem: droppedRecord,
    dropPosition,
  });

export const getRankForDroppedExample = ({
  context,
  targetExample,
  droppedExample,
  dropPosition,
}: {
  context: ApiClientFeatureContext;
  targetExample: RQAPI.ExampleApiRecord;
  droppedExample: RQAPI.ExampleApiRecord;
  dropPosition: "before" | "after" | null;
}): string =>
  getRankForDroppedItem({
    context,
    parentId: targetExample.parentRequestId,
    targetItem: targetExample,
    droppedItem: droppedExample,
    dropPosition,
  });
