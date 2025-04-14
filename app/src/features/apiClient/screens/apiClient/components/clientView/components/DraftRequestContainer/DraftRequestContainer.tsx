import React, { useCallback, useState } from "react";
import { RequestView } from "../RequestView/RequestView";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import { RQAPI } from "features/apiClient/types";
import { RequestViewTabSource } from "../RequestView/requestViewTabSource";

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

  const { setTitle, replace } = useGenericState();

  const updateTabSource = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      replace(
        new RequestViewTabSource({
          id: apiEntryDetails.id,
          title: apiEntryDetails.name,
          apiEntryDetails: apiEntryDetails,
        })
      );
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
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return <RequestView requestId={requestViewState.entryDetails.id} apiEntryDetails={requestViewState.entryDetails} />;
  }
};
