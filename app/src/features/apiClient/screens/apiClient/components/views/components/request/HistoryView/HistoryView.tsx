import React, { useCallback } from "react";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";

export const HistoryView: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const { history, addToHistory, setCurrentHistoryIndex, selectedHistoryIndex } = useApiClientContext();

  const entry = {
    type: RQAPI.RecordType.API,
    data: { ...history[selectedHistoryIndex] },
  } as RQAPI.ApiRecord;

  const handleSaveCallback = useCallback(
    (entryDetails: RQAPI.ApiRecord) => {
      openTab(
        new RequestViewTabSource({
          id: entryDetails.id,
          apiEntryDetails: entryDetails,
          title: entryDetails.name || entryDetails.data.request?.url,
        }),
        { preview: false }
      );
    },
    [openTab]
  );

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      setCurrentHistoryIndex(history.length);
      addToHistory(entry);
    },
    [addToHistory, setCurrentHistoryIndex, history]
  );

  return (
    <GenericApiClient
      isCreateMode
      onSaveCallback={handleSaveCallback}
      apiEntryDetails={entry}
      handleAppRequestFinished={handleAppRequestFinished}
    />
  );
};
