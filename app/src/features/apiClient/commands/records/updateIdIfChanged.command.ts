import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { forceRefreshRecords } from "./force-refresh.command";
import { closeCorruptedTabs } from "../tabs";

export async function updateIdIfChanged(ctx: ApiClientFeatureContext, params: {
  existingId: string,
  newId: string,
  type: RQAPI.RecordType.COLLECTION | RQAPI.RecordType.API,
}) {
  if(params.existingId === params.newId) {
    return;
  }
  const wasForceRefreshed = await forceRefreshRecords(ctx);
  if(!wasForceRefreshed) {
    return;
  }

  const tabSourceName = params.type === RQAPI.RecordType.API ? 'request' : 'collection'; 
  getTabServiceActions().updateTabSource(params.existingId, tabSourceName, (source) => {
    if(params.type === RQAPI.RecordType.API) {
      return new RequestViewTabSource({
        ...source.metadata,
        id: params.newId,
      })
    }

    return new CollectionViewTabSource({
      ...source.metadata,
      id: params.newId,
    })
  });

  closeCorruptedTabs();
}
