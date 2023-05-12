import { Col, Modal, Row } from "antd";
import SpinnerColumn from "components/misc/SpinnerColumn";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
// import { convertHarJsonToRQLogs } from "../harLogs/converter";
import { Har } from "../harLogs/types";
import SessionSaveModal from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/SessionSaveModal";
import {
  trackHarImportButtonClicked,
  trackHarImportCanceled,
  trackHarImportCompleted,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { RQButton } from "lib/design-system/components";

interface Props {
  onSaved: (sessionId: string) => void;
  btnText?: string;
}

const ImportandSaveNetworkHarModalButton: React.FC<Props> = ({ onSaved, btnText }) => {
  const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);

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

  const [processingDataToImport, setProcessingDataToImport] = useState(false);
  const [importedHar, setImportedHar] = useState<Har>();

  const handleImportedData = useCallback(
    (data: Har) => {
      setImportedHar(data);
      trackHarImportCompleted();
      openSaveModal();
    },
    [openSaveModal]
  );

  const ImportRulesDropzone = () => {
    const onDrop = useCallback(async (acceptedFiles: any) => {
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
    }, []);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Row align="middle" justify="center">
          <Col>
            <Row justify="center">
              <h1 className="display-2">
                <FiUpload />
              </h1>
            </Row>
            <Row justify="center">
              <p>Drag and drop your exported sessions file, or click to select</p>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const renderLoader = () => <SpinnerColumn message="Processing data" />;

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
      <Modal
        className="modal-dialog-centered"
        open={isDropZoneVisible}
        width="60%"
        bodyStyle={{ padding: 12 }}
        maskClosable={false}
        footer={null}
        onCancel={() => {
          trackHarImportCanceled();
          closeDropZone();
        }}
        title="Import Traffic Logs"
      >
        {processingDataToImport ? renderLoader() : <ImportRulesDropzone />}
      </Modal>
      <SessionSaveModal isVisible={isSaveModalVisible} closeModal={closeSaveModal} har={importedHar} onSave={onSaved} />
    </React.Fragment>
  );
};

export default ImportandSaveNetworkHarModalButton;
