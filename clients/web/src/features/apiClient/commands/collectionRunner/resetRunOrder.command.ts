import { getAllChildrenRecords } from "features/apiClient/hooks/useChildren.hook";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RunConfigState } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import { RQAPI } from "features/apiClient/types";

export function resetRunOrder(
  ctx: ApiClientFeatureContext,
  params: {
    collectionId: RQAPI.CollectionRecord["id"];
    setRunOrder: RunConfigState["setRunOrder"];
  }
) {
  const { collectionId, setRunOrder } = params;
  const records = getAllChildrenRecords(ctx, collectionId).filter(isApiRequest);
  const parsedRunOrder: RQAPI.RunOrder = records.map((record) => ({ id: record.id, isSelected: true }));
  setRunOrder(parsedRunOrder);
}
