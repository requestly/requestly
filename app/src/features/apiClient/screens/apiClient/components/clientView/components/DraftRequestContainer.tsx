import React, { useCallback, useState } from "react";
import { RequestView } from "./RequestContainer";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";

export const DraftRequestContainer: React.FC = () => {
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [requestId, setRequestId] = useState<string>(null);
  // const [cbEntry, setCbEntry] = useState({});

  const { setTitle, setUrl } = useGenericState();

  const onSaveCallback = useCallback(
    (requestId: string) => {
      setIsCreateMode(false);
      setRequestId(requestId);
      // setCbEntry(callbackEntry);
      setTitle(requestId);
      setUrl(`${PATHS.API_CLIENT.ABSOLUTE}/request/${requestId}`);
    },
    [setTitle, setUrl]
  );

  if (isCreateMode) {
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return (
      <RequestView
        // entry={{
        //   type: RQAPI.RecordType.API,
        //   data: cbEntry,
        // }}
        requestId={requestId}
      />
    );
  }
};
