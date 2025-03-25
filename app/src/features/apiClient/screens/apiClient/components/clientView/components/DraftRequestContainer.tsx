import React, { useCallback, useState } from "react";
import { RequestView } from "./RequestContainer";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";

export const DraftRequestContainer: React.FC = () => {
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [requestId, setRequestId] = useState<string>(null);

  const { updateTitle, updateUrl } = useGenericState();

  const onSaveCallback = useCallback(
    (requestId: string) => {
      setIsCreateMode(false);
      setRequestId(requestId);
      updateTitle(requestId);
      updateUrl(`${PATHS.API_CLIENT.ABSOLUTE}/request/${requestId}`);
    },
    [updateTitle, updateUrl]
  );

  if (isCreateMode) {
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return <RequestView requestId={requestId} />;
  }
};
