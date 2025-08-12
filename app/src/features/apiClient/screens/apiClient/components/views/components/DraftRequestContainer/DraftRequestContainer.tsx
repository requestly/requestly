import React, { useCallback, useState } from "react";
import { RequestView } from "../RequestView/RequestView";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import { RQAPI } from "features/apiClient/types";
// import { RequestViewTabSource } from "../RequestView/requestViewTabSource";
// import { useContextId } from "features/apiClient/contexts/contextId.context";

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

  const { setTitle, replace } = useGenericState();

  const updateTabSource = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      throw new Error("Not implemented!");
      // replace(
      //   new RequestViewTabSource({
      //     id: apiEntryDetails.id,
      //     title: apiEntryDetails.name,
      //     apiEntryDetails: apiEntryDetails,
      //     context: {
      //       id: contextId,
      //     }
      //   })
      // );
    },
    [replace]
  );

  const onSaveCallback = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      setRequestViewState({
        isCreateMode: false,
        entryDetails: apiEntryDetails,
      });
      setTitle(apiEntryDetails.name);
      updateTabSource(apiEntryDetails);
    },
    [setTitle, updateTabSource]
  );

  if (requestViewState.isCreateMode === true) {
    return <DraftRequestView onSaveCallback={onSaveCallback} apiEntryType={apiEntryType} />;
  } else {
    return <RequestView requestId={requestViewState.entryDetails.id} apiEntryDetails={requestViewState.entryDetails} />;
  }
};
