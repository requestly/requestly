import { getAllChildrenRecords } from "features/apiClient/hooks/useChildren.hook";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";

export function resetRunOrder(
  ctx: ApiClientFeatureContext,
  params: {
    collectionId: RQAPI.CollectionRecord["id"];
    setOrderedRequests: (requests: RQAPI.OrderedRequests) => void;
  }
) {
  const { collectionId, setOrderedRequests } = params;
  const records = getAllChildrenRecords(ctx, collectionId).filter(isApiRequest);
  const parsedOrderedRequests: RQAPI.OrderedRequests = records.map((record) => ({ record, isSelected: true }));
  setOrderedRequests(parsedOrderedRequests);
}
