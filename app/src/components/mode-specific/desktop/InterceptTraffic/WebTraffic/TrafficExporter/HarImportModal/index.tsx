import React, { useCallback, useState } from "react";
import { Har } from "../harLogs/types";
import SessionSaveModal from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/SessionSaveModal";
import {
  trackHarImportButtonClicked,
  trackHarImportCanceled,
  trackHarImportCompleted,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { saveNetworkSession } from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/actions";
import { toast } from "utils/Toast";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";

interface Props {
  onSaved: (sessionId: string) => void;
  btnText?: string;
}

const HarImportModal: React.FC<Props> = ({ onSaved, btnText }) => {
  const [importedHar, setImportedHar] = useState<Har>();
  const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [processingUploadedData, setProcessingUploadedData] = useState(false);

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
    async (data: Har, name: string) => {
      setImportedHar(data);
      trackHarImportCompleted();
      trackRQDesktopLastActivity(SESSION_RECORDING.network.import.har.completed);
      if (name) {
        // just in case the file reader is unable to read the name
        const id = await saveNetworkSession(name, data);
        toast.success("Network session successfully saved!");
        trackNetworkSessionSaved();
        setProcessingUploadedData(false);
        onSaved(id);
      } else {
        openSaveModal();
      }
    },
    [onSaved, openSaveModal]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      //Ignore other uploaded files, just choosing the first one
      const file = acceptedFiles[0];
      const name = file.name;

      const reader = new FileReader();

      reader.onabort = () => closeDropZone();
      reader.onerror = () => closeDropZone();
      reader.onload = () => {
        //Render the loader
        setProcessingUploadedData(true);
        try {
          const importedHar: Har = JSON.parse(reader.result as string);
          handleImportedData(importedHar, name);
        } catch (error) {
          setProcessingUploadedData(false);
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
          trackRQDesktopLastActivity(SESSION_RECORDING.network.import.har.btn_clicked);
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
          trackRQDesktopLastActivity(SESSION_RECORDING.network.import.har.canceled);
          closeDropZone();
        }}
      >
        <div className="rq-modal-content">
          <div className="header text-center mb-16">Import Traffic Logs</div>
          <FilePicker
            onFilesDrop={onDrop}
            loaderMessage="Processing data..."
            isProcessing={processingUploadedData}
            title="Drag and drop your exported sessions file"
          />
        </div>
      </RQModal>

      {/* NO LONGER VISIBLE, still here for some extreme edge case */}
      <SessionSaveModal isVisible={isSaveModalVisible} closeModal={closeSaveModal} har={importedHar} onSave={onSaved} />
    </React.Fragment>
  );
};

export default HarImportModal;
