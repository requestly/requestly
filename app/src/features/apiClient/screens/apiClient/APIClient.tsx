import React from "react";
import APIClientView from "./components/clientView/APIClientView";
import { DeleteApiRecordModal, ImportRequestModal } from "./components/modals";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const {
    recordToBeDeleted,
    isDeleteModalOpen,
    onDeleteModalClose,
    addToHistory,
    selectedEntry,
    selectedEntryDetails,
    isLoading,
    isImportModalOpen,
    handleImportRequest,
    onImportRequestModalClose,
  } = useApiClientContext();

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <APIClientView
          // TODO: Fix - "apiEntry" is used for history, remove this prop and derive everything from "apiEntryDetails"
          apiEntry={selectedEntry ?? selectedEntryDetails?.data}
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
