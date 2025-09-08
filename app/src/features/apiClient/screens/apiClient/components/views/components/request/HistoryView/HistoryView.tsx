import React, { useCallback, useMemo } from "react";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const HistoryView: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const { history, addToHistory, setCurrentHistoryIndex, selectedHistoryIndex } = useApiClientContext();
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);

  const entry = useMemo(() => {
    return {
      type: RQAPI.RecordType.API,
      data: { ...history[selectedHistoryIndex] },
    } as RQAPI.ApiRecord;
  }, [history, selectedHistoryIndex]);

  const hideSaveBtn = viewMode === ApiClientViewMode.MULTI;

  const handleSaveCallback = useCallback(
    (entryDetails: RQAPI.ApiRecord) => {
      if (hideSaveBtn) {
        return;
      }

      openTab(
        new RequestViewTabSource({
          id: entryDetails.id,
          apiEntryDetails: entryDetails,
          title: entryDetails.name || entryDetails.data.request?.url,
          context: {},
        }),
        { preview: false }
      );
    },
    [openTab, hideSaveBtn]
  );

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      setCurrentHistoryIndex(history.length);
      addToHistory(entry);
    },
    [addToHistory, setCurrentHistoryIndex, history]
  );

  return (
    <GenericApiClient
      isCreateMode
      isOpenInModal={hideSaveBtn} // TODO: rename isOpenInModal prop with some meaningful name
      onSaveCallback={handleSaveCallback}
      apiEntryDetails={entry}
      handleAppRequestFinished={handleAppRequestFinished}
    />
  );
};
