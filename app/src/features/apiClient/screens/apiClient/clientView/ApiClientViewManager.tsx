import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { Result } from "antd";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import { getBottomSheetState } from "store/selectors";
import "../apiClient.scss";

type BaseProps = {
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryDetails?: RQAPI.ApiRecord;
  isHistoryMode?: boolean;
};

type CreateModeProps = BaseProps & {
  isCreateMode: true;
};

type EditModeProps = BaseProps & {
  isCreateMode: false;
  requestId: string;
};

type Props = CreateModeProps | EditModeProps;

export const ApiClientViewManager: React.FC<Props> = React.memo((props) => {
  const { isCreateMode, isHistoryMode } = props;
  const { history, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  const currentBottomSheetState = useSelector((state) => getBottomSheetState(state, "api_client"));
  const selectedEntryDetails = useApiRecord(isCreateMode ? "" : (props as EditModeProps).requestId);

  const onSaveCallback = useMemo(() => props.onSaveCallback ?? (() => {}), [props.onSaveCallback]);
  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      if (isHistoryMode) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryMode, setCurrentHistoryIndex, history.length]
  );

  const content = useMemo(() => {
    if (selectedEntryDetails.type === RQAPI.RecordType.COLLECTION) {
      return null;
    }

    if (!selectedEntryDetails.data) {
      return (
        <Result status="error" title="Request not found" subTitle="Oops! Looks like this request doesn't exist." />
      );
    }

    return (
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <ClientViewFactory
            apiRecord={selectedEntryDetails}
            handleRequestFinished={handleAppRequestFinished}
            onSaveCallback={onSaveCallback}
            isCreateMode={isCreateMode}
          />
        </AutogenerateProvider>
      </div>
    );
  }, [selectedEntryDetails, handleAppRequestFinished, onSaveCallback, isCreateMode]);

  const shouldInheritState = currentBottomSheetState && typeof currentBottomSheetState.open === "boolean";
  const defaultOpen = shouldInheritState ? currentBottomSheetState.open : true;
  const defaultPlacement = shouldInheritState
    ? currentBottomSheetState.placement === "right"
      ? BottomSheetPlacement.RIGHT
      : BottomSheetPlacement.BOTTOM
    : BottomSheetPlacement.BOTTOM;

  return (
    <BottomSheetProvider context="api_client" defaultPlacement={defaultPlacement} isSheetOpenByDefault={defaultOpen}>
      {content}
    </BottomSheetProvider>
  );
});
