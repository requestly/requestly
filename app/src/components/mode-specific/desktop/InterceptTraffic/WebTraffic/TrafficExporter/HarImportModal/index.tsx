import { Button, Col, Modal, Row } from "antd";
import SpinnerColumn from "components/misc/SpinnerColumn";
import Logger from "lib/logger";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { convertHarJsonToRQLogs } from "../harLogs/converter";
import { Har, Log } from "../harLogs/types";

interface Props {
  onRulesImported: (logs: Log[]) => void;
  btnText?: string;
}

const HarImportModalButton: React.FC<Props> = ({ onRulesImported: onImportReady, btnText }) => {
  const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
  const closeDropZone = useCallback(() => {
    setIsDropZoneVisible(false);
  }, []);
  const openDropZone = useCallback(() => {
    setIsDropZoneVisible(true);
  }, []);

  const [processingDataToImport, setProcessingDataToImport] = useState(false);

  const handleImportedData = useCallback(
    (data: Log[]) => {
      console.log("handling logs", data);
      onImportReady(data);
      closeDropZone();
    },
    [onImportReady, closeDropZone]
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
        let UILogs = [];
        try {
          const importedHar: Har = JSON.parse(reader.result as string);
          UILogs = convertHarJsonToRQLogs(importedHar);
          //Start processing data
          handleImportedData(UILogs);
        } catch (error) {
          Logger.log(error);
          alert("Imported file doesn't match Requestly format. Please choose another file.");
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
              <p>Drag and drop requestly export file, or click to select</p>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const renderLoader = () => <SpinnerColumn message="Processing data" />;

  return (
    <React.Fragment>
      <Button
        type="primary"
        onClick={() => {
          openDropZone();
        }}
        style={{ margin: "24px" }}
      >
        {btnText ? btnText : "Import Har File"}
      </Button>
      <Modal
        className="modal-dialog-centered "
        open={isDropZoneVisible}
        width="60%"
        bodyStyle={{ padding: 12 }}
        maskClosable={false}
        footer={null}
        onCancel={closeDropZone}
        title="Import Traffic Logs"
      >
        {processingDataToImport ? renderLoader() : <ImportRulesDropzone />}
      </Modal>
    </React.Fragment>
  );
};

export default HarImportModalButton;
