import React, { useCallback, useState } from "react";
import { Har } from "../harLogs/types";
import SessionSaveModal from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/SessionSaveModal";
import {
  trackHarImportButtonClicked,
  trackHarImportCanceled,
  trackHarImportCompleted,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";

interface Props {
  onSaved: (sessionId: string) => void;
  btnText?: string;
}

const HarImportModal: React.FC<Props> = ({ onSaved, btnText }) => {
  const [importedHar, setImportedHar] = useState<Har>();
  const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [processingDataToImport, setProcessingDataToImport] = useState(false);

  const closeDropZone = useCallback(() => {
    setIsDropZoneVisible(false);
  }, []);

  const openDropZone = useCallback(() => {
    setIsDropZoneVisible(true);
  }, []);

  const closeSaveModal = useCallback(() => {
    setIsSaveModalVisible(false);
    closeDropZone();
  }, [closeDropZone]);

  const openSaveModal = useCallback(() => {
    closeDropZone();
    setIsSaveModalVisible(true);
  }, [closeDropZone]);

  const handleImportedData = useCallback(
    (data: Har) => {
      setImportedHar(data);
      trackHarImportCompleted();
      openSaveModal();
    },
    [openSaveModal]
  );

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];

      const reader = new FileReader();

      reader.onabort = () => closeDropZone();
      reader.onerror = () => closeDropZone();
      reader.onload = () => {
        //Render the loader
        setProcessingDataToImport(true);
        try {
          const importedHar: Har = JSON.parse(reader.result as string);
          handleImportedData(importedHar);
          setProcessingDataToImport(false);
        } catch (error) {
          setProcessingDataToImport(false);
          alert("Imported file doesn't match the HAR format. Please choose another file.");
          closeDropZone();
        }
      };
      reader.readAsText(file);
    },
    [closeDropZone, handleImportedData]
  );

  return (
    <React.Fragment>
      <RQButton
        type="primary"
        onClick={() => {
          trackHarImportButtonClicked();
          openDropZone();
        }}
        className="mt-8"
      >
        {btnText ? btnText : "Import HAR File"}
      </RQButton>
      <RQModal
        width="50%"
        open={isDropZoneVisible}
        maskClosable={false}
        onCancel={() => {
          trackHarImportCanceled();
          closeDropZone();
        }}
      >
        <div className="rq-modal-content">
          <div className="header text-center mb-16">Import Traffic Logs</div>
          <FilePicker
            onFilesDrop={onDrop}
            loaderMessage="Processing data..."
            isProcessing={processingDataToImport}
            title="Drag and drop your exported sessions file"
          />
        </div>
      </RQModal>
      <SessionSaveModal isVisible={isSaveModalVisible} closeModal={closeSaveModal} har={importedHar} onSave={onSaved} />
    </React.Fragment>
  );
};

export default HarImportModal;
