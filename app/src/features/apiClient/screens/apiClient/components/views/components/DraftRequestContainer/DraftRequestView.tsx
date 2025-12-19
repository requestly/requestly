import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { getBottomSheetState } from "store/selectors";
import { RQAPI } from "features/apiClient/types";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryType: RQAPI.ApiEntryType;
}> = ({ onSaveCallback, apiEntryType }) => {
  const apiEntryDetails = useMemo(() => getEmptyDraftApiRecord(apiEntryType), [apiEntryType]);

  const bottomSheetState = useSelector((state) => getBottomSheetState(state, "api_client"));

  const inheritFromRedux = typeof bottomSheetState?.open === "boolean";

  const defaultOpen = inheritFromRedux ? bottomSheetState.open : true;

  const defaultPlacement = inheritFromRedux
    ? bottomSheetState.placement === "right"
      ? BottomSheetPlacement.RIGHT
      : BottomSheetPlacement.BOTTOM
    : BottomSheetPlacement.BOTTOM;

  return (
    <BottomSheetProvider context="api_client" defaultPlacement={defaultPlacement} isSheetOpenByDefault={defaultOpen}>
      <GenericApiClient
        isCreateMode
        apiEntryDetails={apiEntryDetails}
        onSaveCallback={onSaveCallback}
        handleAppRequestFinished={() => {}}
      />
    </BottomSheetProvider>
  );
};
