import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { getBottomSheetState } from "store/selectors";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./historyView.scss";

export const HistoryView: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const { history, addToHistory, setCurrentHistoryIndex, selectedHistoryIndex } = useApiClientContext();
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);
  const currentBottomSheetState = useSelector((state) => getBottomSheetState(state, "api_client"));

  const entry = useMemo(() => {
    if (selectedHistoryIndex != null && history?.[selectedHistoryIndex]) {
      return {
        type: RQAPI.RecordType.API,
        data: { ...history[selectedHistoryIndex] },
      } as RQAPI.ApiRecord;
    }

    return null;
  }, [history, selectedHistoryIndex]);

  const hideSaveBtn = viewMode === ApiClientViewMode.MULTI;

  const handleSaveCallback = useCallback(
    (entryDetails: RQAPI.ApiRecord) => {
      if (hideSaveBtn) {
        return;
      }

      openTab(
        new RequestViewTabSource({
          id: entryDetails.id,
          apiEntryDetails: entryDetails,
          title: entryDetails.name || entryDetails.data.request?.url,
          context: {},
        }),
        { preview: false }
      );
    },
    [openTab, hideSaveBtn]
  );

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      setCurrentHistoryIndex(history.length);
      addToHistory(entry);
    },
    [addToHistory, setCurrentHistoryIndex, history]
  );

  const shouldInheritState = currentBottomSheetState && typeof currentBottomSheetState.open === "boolean";

  if (!entry) {
    return (
      <div className="empty-state">
        <img src={"/assets/media/apiClient/response-empty-state.svg"} alt="empty card" width={80} height={80} />
        <div className="api-client-empty-response-view__title">Nothing to see here!</div>
        <div className="api-client-empty-response-view__description">Select a request from the history to view it</div>
      </div>
    );
  }
  const defaultOpen = shouldInheritState ? currentBottomSheetState.open : true;
  const defaultPlacement = shouldInheritState
    ? currentBottomSheetState.placement === "right"
      ? BottomSheetPlacement.RIGHT
      : BottomSheetPlacement.BOTTOM
    : BottomSheetPlacement.BOTTOM;

  return (
    <BottomSheetProvider
      key={"api_client_history"}
      context="api_client"
      defaultPlacement={defaultPlacement}
      isSheetOpenByDefault={defaultOpen}
    >
      <GenericApiClient
        isCreateMode
        isOpenInModal={hideSaveBtn} // TODO: rename isOpenInModal prop with some meaningful name
        onSaveCallback={handleSaveCallback}
        apiEntryDetails={entry}
        handleAppRequestFinished={handleAppRequestFinished}
      />
    </BottomSheetProvider>
  );
};
