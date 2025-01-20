import React from "react";
import { Modal } from "antd";
import { FilePicker } from "components/common/FilePicker";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { RQButton } from "lib/design-system-v2/components";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import {} from "modules/analytics/events/features/apiClient";
import "./importModal.scss";
import useFileImporter from "hooks/useFileImporter";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    isImporting,
    error,
    processFile,
    handleImportData,
    resetImportData,
    processingStatus = "processed",
  } = useFileImporter("RQ");

  const handleFileDrop = (files: File[]) => {
    const file = files[0];
    processFile(file);
  };

  return (
    <Modal
      className="import-collections-modal"
      open={isOpen}
      onCancel={() => {
        onClose();
        resetImportData();
      }}
      title="Import collections & environments"
      footer={null}
      width={600}
    >
      {error ? (
        <div className="collections-parsed-container">
          <MdErrorOutline className="collections-parse-result-icon error" />
          <div className="collections-import-error-text">{error}</div>
          <RQButton
            type="primary"
            onClick={() => {
              resetImportData();
            }}
          >
            Try another file
          </RQButton>
        </div>
      ) : processingStatus === "processed" ? (
        <div className="collections-parsed-container">
          <MdCheckCircleOutline className="collections-parse-result-icon success" />
          <div className="collections-parse-result-text">Data parsed successfully</div>
          <RQButton type="primary" onClick={handleImportData.bind(this, onClose)} loading={isImporting}>
            Import Data
          </RQButton>
        </div>
      ) : (
        <FilePicker
          maxFiles={1}
          onFilesDrop={handleFileDrop}
          isProcessing={processingStatus === "processing"}
          title="Browse or Drop your Requestly collections or environments export files here"
          subtitle="Accepted file formats: JSON"
          selectorButtonTitle={error ? "Try another file" : "Select file"}
        />
      )}
    </Modal>
  );
};
