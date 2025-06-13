import React, { useCallback } from "react";
import { APIClient } from "features/apiClient/screens/apiClient/APIClient";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RQAPI } from "features/apiClient/types";

export const HistoryView: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

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

  return <APIClient isCreateMode isHistoryMode onSaveCallback={handleSaveCallback} />;
};
