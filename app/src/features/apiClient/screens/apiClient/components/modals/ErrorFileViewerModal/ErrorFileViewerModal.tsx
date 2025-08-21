import { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import Editor from "componentsV2/CodeEditor";
import { ErroredRecord, FileType } from "features/apiClient/helpers/modules/sync/local/services/types";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import "./errorFileViewerModal.scss";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { forceRefreshRecords } from "features/apiClient/commands/records";
import { forceRefreshEnvironments } from "features/apiClient/commands/environments";

interface ErrorFileViewerModalProps {
  isOpen: boolean;
  errorFile: ErroredRecord;
  onClose: () => void;
}

export const ErrorFileViewerModal = ({ isOpen, onClose, errorFile }: ErrorFileViewerModalProps) => {
  const contextId = useContextId();
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    const fetchErrorFileData = async () => {
      const context = getContext(contextId);
      const { apiClientRecordsRepository } = context.repositories;
      const result = await apiClientRecordsRepository.getRawFileData(errorFile.path);
      if (result.success) {
        setFileContent(result.data);
      }
    };
    fetchErrorFileData();
  }, [contextId, getContext, errorFile.path]);

  const handlePostSuccessfulWrite = () => {
    const context = getContext(contextId);
    if (
      errorFile.type === FileType.API ||
      errorFile.type === FileType.AUTH ||
      errorFile.type === FileType.COLLECTION_VARIABLES ||
      errorFile.type === FileType.DESCRIPTION
    ) {
      forceRefreshRecords(context);
    }
    if (errorFile.type === FileType.ENVIRONMENT) {
      forceRefreshEnvironments(context);
    }
    onClose();
    toast.success("File saved and included successfully");
  };

  const handleSave = async () => {
    try {
      const context = getContext(contextId);
      const { apiClientRecordsRepository } = context.repositories;
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
