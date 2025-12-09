import { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import Editor from "componentsV2/CodeEditor";
import { ErroredRecord, FileType } from "features/apiClient/helpers/modules/sync/local/services/types";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useCommand } from "features/apiClient/commands";
import "./errorFileViewerModal.scss";

interface ErrorFileViewerModalProps {
  isOpen: boolean;
  errorFile: ErroredRecord;
  onClose: () => void;
}

export const ErrorFileViewerModal = ({ isOpen, onClose, errorFile }: ErrorFileViewerModalProps) => {
  const [fileContent, setFileContent] = useState<unknown>(null);
  const { apiClientRecordsRepository } = useApiClientRepository();
  const {
    env: { forceRefreshEnvironments },
    api: { forceRefreshRecords },
  } = useCommand();

  useEffect(() => {
    const fetchErrorFileData = async () => {
      const result = await apiClientRecordsRepository.getRawFileData(errorFile.path);
      if (result.success) {
        setFileContent(result.data);
      }
    };
    fetchErrorFileData();
  }, [apiClientRecordsRepository, errorFile.path]);

  const handlePostSuccessfulWrite = () => {
    if (
      errorFile.type === FileType.API ||
      errorFile.type === FileType.AUTH ||
      errorFile.type === FileType.COLLECTION_VARIABLES ||
      errorFile.type === FileType.DESCRIPTION
    ) {
      forceRefreshRecords();
    }
    if (errorFile.type === FileType.ENVIRONMENT) {
      forceRefreshEnvironments();
    }
    onClose();
    toast.success("File saved and included successfully");
  };

  const handleSave = async () => {
    try {
      const result = await apiClientRecordsRepository.writeToRawFile(errorFile.path, fileContent, errorFile.type);
      if (!result.success) {
        throw new Error(result.message || "Failed to save error file");
      }
      handlePostSuccessfulWrite();
    } catch (error) {
      notification.error({
        message: `Failed to save error file`,
        description: error?.message,
        placement: "bottomRight",
      });
    }
  };

  return (
    <Modal
      title="Correct file error and include in request"
      className="custom-rq-modal error-file-viewer-modal"
      width={800}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <div className="error-file-viewer-modal-content">
        <div className="error-message-container">
          <div className="error-message-container-title">ERROR DETAILS</div>
          <div className="error-message-container-message">
            <span className="error-message-container-message-prefix">
              <MdWarningAmber /> Could not fetch record:{" "}
            </span>
            <span>{errorFile.error}</span>
          </div>
        </div>

        <div className="error-file-editor">
          <Editor
            language={EditorLanguage.JSON}
            handleChange={setFileContent}
            value={fileContent}
            isResizable={true}
            hideCharacterCount
            hideToolbar
          />
        </div>
        <div className="error-file-editor-footer">
          <RQButton onClick={onClose}>Cancel</RQButton>
          <RQButton type="primary" onClick={handleSave}>
            Save and include
          </RQButton>
        </div>
      </div>
    </Modal>
  );
};
