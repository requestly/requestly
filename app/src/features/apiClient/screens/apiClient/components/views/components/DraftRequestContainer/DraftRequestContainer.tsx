import React, { useCallback, useState } from "react";
import { RequestView } from "../RequestView/RequestView";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import { RQAPI } from "features/apiClient/types";
import { RequestViewTabSource } from "../RequestView/requestViewTabSource";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

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
  const getLastUsedContext = useApiClientFeatureContextProvider((s) => s.getLastUsedContext);

  const updateTabSource = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      const context = getLastUsedContext();
      if (!context) {
        throw new Error("Context not found!");
      }
      replace(
        new RequestViewTabSource({
          id: apiEntryDetails.id,
          title: apiEntryDetails.name,
          apiEntryDetails: apiEntryDetails,
          context: {
            id: context.id,
          },
        })
      );
    },
    [getLastUsedContext, replace]
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
