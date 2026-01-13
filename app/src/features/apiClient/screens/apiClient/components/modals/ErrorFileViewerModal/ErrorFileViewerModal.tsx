import { useEffect, useState, useCallback } from "react";
import { Modal, notification } from "antd";
import Editor from "componentsV2/CodeEditor";
import { ErroredRecord, FileType } from "features/apiClient/helpers/modules/sync/local/services/types";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import { useApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { forceRefreshRecords } from "features/apiClient/slices/apiRecords/thunks";
import { forceRefreshEnvironments } from "features/apiClient/slices/environments/thunks";
import "./errorFileViewerModal.scss";

interface ErrorFileViewerModalProps {
  isOpen: boolean;
  errorFile: ErroredRecord;
  onClose: () => void;
}

export const ErrorFileViewerModal = ({ isOpen, onClose, errorFile }: ErrorFileViewerModalProps) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const context = useApiClientFeatureContext();
  const { apiClientRecordsRepository, environmentVariablesRepository } = context.repositories;

  useEffect(() => {
    const fetchErrorFileData = async () => {
      const result = await apiClientRecordsRepository.getRawFileData(errorFile.path);
      if (result.success) {
        setFileContent(result.data);
      }
    };
    fetchErrorFileData();
  }, [apiClientRecordsRepository, errorFile.path]);

  const handlePostSuccessfulWrite = useCallback(async () => {
    if (
      errorFile.type === FileType.API ||
      errorFile.type === FileType.AUTH ||
      errorFile.type === FileType.COLLECTION_VARIABLES ||
      errorFile.type === FileType.DESCRIPTION
    ) {
      await context.store
        .dispatch(
          forceRefreshRecords({
            repository: apiClientRecordsRepository,
          }) as any
        )
        .unwrap();
    }
    if (errorFile.type === FileType.ENVIRONMENT) {
      await context.store
        .dispatch(
          forceRefreshEnvironments({
            repository: environmentVariablesRepository,
          }) as any
        )
        .unwrap();
    }
    onClose();
    toast.success("File saved and included successfully");
  }, [context, apiClientRecordsRepository, environmentVariablesRepository, errorFile.type, onClose]);

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
            value={fileContent ?? ""}
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
