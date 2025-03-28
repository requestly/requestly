import React, { useCallback, useState } from "react";
import { RequestView } from "../RequestView/RequestView";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";
import { RQAPI } from "features/apiClient/types";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { DraftRequestContainerTabSource } from "./draftRequestContainerTabSource";
import { useSetUrl } from "componentsV2/Tabs/tabUtils";

type RequestViewState =
  | {
      entryDetails: RQAPI.ApiRecord;
      isCreateMode: false;
    }
  | {
      isCreateMode: true;
    };

export const DraftRequestContainer: React.FC<{ draftId: string }> = ({ draftId }) => {
  const [requestViewState, setRequestViewState] = useState<RequestViewState>({
    isCreateMode: true,
  });

  const { setTitle } = useGenericState();
  const [tabsIndex, tabs] = useTabServiceWithSelector((state) => [state.tabsIndex, state.tabs]);
  const { setUrl } = useSetUrl();

  const updateTabUrl = useCallback(
    (newPath: string) => {
      const currentTabId = tabsIndex.get("request").get(draftId);
      const tabSource = tabs.get(currentTabId).getState().source as DraftRequestContainerTabSource;
      tabSource.setUrlPath(newPath);
      setUrl(newPath, true);
    },
    [draftId, setUrl, tabs, tabsIndex]
  );

  const onSaveCallback = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      setRequestViewState({
        isCreateMode: false,
        entryDetails: apiEntryDetails,
      });
      setTitle(apiEntryDetails.name);
      updateTabUrl(`${PATHS.API_CLIENT.ABSOLUTE}/request/${apiEntryDetails.id}`);
    },
    [setTitle, updateTabUrl]
  );

  if (requestViewState.isCreateMode === true) {
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return <RequestView requestId={requestViewState.entryDetails.id} apiEntryDetails={requestViewState.entryDetails} />;
  }
};
