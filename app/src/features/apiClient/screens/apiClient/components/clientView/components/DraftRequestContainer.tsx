import React, { useCallback, useState } from "react";
import { RequestView } from "./RequestContainer";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";
import { RQAPI } from "features/apiClient/types";

type RequestDetails =
  | {
      entryDetails: RQAPI.ApiRecord;
      isCreateMode: false;
    }
  | {
      isCreateMode: true;
    };

export const DraftRequestContainer: React.FC = () => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    isCreateMode: true,
  });

  const { setTitle, setUrl } = useGenericState();

  const onSaveCallback = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      setRequestDetails({
        isCreateMode: false,
        entryDetails: apiEntryDetails,
      });
      setTitle(apiEntryDetails.name);
      setUrl(`${PATHS.API_CLIENT.ABSOLUTE}/request/${apiEntryDetails.id}`);
    },
    [setTitle, setUrl]
  );

  if (requestDetails.isCreateMode === true) {
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return <RequestView apiEntryDetails={requestDetails.entryDetails} />;
  }
};
