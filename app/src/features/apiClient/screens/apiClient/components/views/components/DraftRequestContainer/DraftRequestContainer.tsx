import React, { useCallback, useState } from "react";
import { RequestView } from "../RequestView/RequestView";
import { DraftRequestView } from "./DraftRequestView";
import { RQAPI } from "features/apiClient/types";
import { RequestViewTabSource } from "../RequestView/requestViewTabSource";
import { apiClientContextRegistry } from "features/apiClient/slices";
import { useHostContext } from "hooks/useHostContext";

type RequestViewState =
  | {
      entryDetails: RQAPI.ApiRecord;
      isCreateMode: false;
    }
  | {
      isCreateMode: true;
    };

export const DraftRequestContainer: React.FC<{ draftId: string; apiEntryType: RQAPI.ApiEntryType }> = ({
  draftId,
  apiEntryType,
}) => {
  const [requestViewState, setRequestViewState] = useState<RequestViewState>({
    isCreateMode: true,
  });

  const { replace } = useHostContext();
  const updateTabSource = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      const context = apiClientContextRegistry.getLastUsedContext();
      if (!context) {
        throw new Error("Context not found!");
      }
      replace(
        new RequestViewTabSource({
          id: apiEntryDetails.id,
          title: apiEntryDetails.name,
          apiEntryDetails: apiEntryDetails,
          context: {
            id: context.workspaceId,
          },
        })
      );
    },
    [replace]
  );

  const onSaveCallback = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      debugger;
      updateTabSource(apiEntryDetails);
      setRequestViewState({
        isCreateMode: false,
        entryDetails: apiEntryDetails,
      });
    },
    [updateTabSource]
  );

  if (requestViewState.isCreateMode === true) {
    return <DraftRequestView onSaveCallback={onSaveCallback}/>;
  } else {
    debugger;
    return <RequestView requestId={requestViewState.entryDetails.id}  />;
  }
};
