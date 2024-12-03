import React, { useEffect, useRef, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { DeleteApiRecordModal, ImportRequestModal } from "./components/modals";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const {
    recordToBeDeleted,
    isDeleteModalOpen,
    onDeleteModalClose,
    addToHistory,
    selectedEntryDetails,
    isLoading,
    isImportModalOpen,
    handleImportRequest,
    onImportRequestModalClose,
  } = useApiClientContext();

  const { activeTab } = useTabsLayoutContext();

  const [apiEntry, setApiEntry] = useState<RQAPI.Entry>();
  const [apiEntryDetails, setApiEntryDetails] = useState<RQAPI.ApiRecord>();

  const hasUpdated = useRef(false);

  const shouldUpdate = activeTab?.id === selectedEntryDetails?.id;

  const isApiEntryDetailsExist = !!apiEntryDetails;

  // Stopping the internal re-renders
  useEffect(() => {
    if (!shouldUpdate) {
      return;
    }

    if (hasUpdated.current) {
      return;
    }

    if (isApiEntryDetailsExist) {
      hasUpdated.current = true;
    }

    setApiEntry(selectedEntryDetails?.data);
    setApiEntryDetails(selectedEntryDetails);
  }, [selectedEntryDetails, isApiEntryDetailsExist, shouldUpdate]);

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <APIClientView
          // TODO: Fix - "apiEntry" is used for history, remove this prop and derive everything from "apiEntryDetails"
          apiEntry={selectedEntryDetails?.data}
          apiEntryDetails={selectedEntryDetails}
          notifyApiRequestFinished={addToHistory}
        />
        <ImportRequestModal
          isRequestLoading={isLoading}
          isOpen={isImportModalOpen}
          handleImportRequest={handleImportRequest}
          onClose={onImportRequestModalClose}
        />

        <DeleteApiRecordModal open={isDeleteModalOpen} record={recordToBeDeleted} onClose={onDeleteModalClose} />
      </div>
    </BottomSheetProvider>
  );
};
