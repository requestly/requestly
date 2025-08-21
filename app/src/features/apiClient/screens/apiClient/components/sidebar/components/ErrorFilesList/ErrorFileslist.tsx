import React, { useCallback, useMemo, useState } from "react";
import { MdEdit } from "@react-icons/all-files/md/MdEdit";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { ErroredRecord, FileType } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ErrorFileViewerModal } from "../../../modals/ErrorFileViewerModal/ErrorFileViewerModal";
import { toast } from "utils/Toast";
import { notification, Popconfirm, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import "./errorFilesList.scss";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { useErroredRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { forceRefreshRecords } from "features/apiClient/commands/records";
import { forceRefreshEnvironments } from "features/apiClient/commands/environments";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

const DeleteErrorFileButton = ({ onDelete }: { onDelete: () => void }) => {
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
  return (
    <Popconfirm
      icon={null}
      title={
        <div className="file-delete-confirmation-container">
          <div className="file-delete-confirmation-title">
            <RiDeleteBinLine /> Delete file!
          </div>
          <div className="file-delete-confirmation-description">
            The file will be deleted from your system. Are you sure you want to delete?
          </div>
        </div>
      }
      placement="top"
      open={isConfirmationPopupOpen}
      onConfirm={() => {
        onDelete();
        setIsConfirmationPopupOpen(false);
      }}
      okButtonProps={{
        danger: true,
        className: "file-delete-confirmation-btn",
      }}
      cancelButtonProps={{
        className: "file-delete-confirmation-btn",
      }}
      okText="Delete"
      onCancel={() => {
        setIsConfirmationPopupOpen(false);
      }}
    >
      {/* TODO: Use RQ icononly button */}
      <RiDeleteBin6Line className="error-file-item-action-icon" onClick={() => setIsConfirmationPopupOpen(true)} />
    </Popconfirm>
  );
};

const getFileIcon = (fileType: FileType) => {
  if (fileType === FileType.ENVIRONMENT) {
    return <CgStack className="error-file-icon" />;
  }
  return <MdOutlineSyncAlt className="error-file-icon" />;
};

const ErrorListHeader: React.FC = () => {
  const [getViewMode] = useApiClientMultiWorkspaceView((s) => [s.getViewMode, s.getSelectedWorkspace]);

  return getViewMode() === ApiClientViewMode.SINGLE ? (
    <div className="error-files-list-header">
      <MdWarningAmber />
      ERROR FILES
    </div>
  ) : null;
};

const ErrorFileItemTitle: React.FC<{ contextId: string; file: ErroredRecord }> = ({ contextId, file }) => {
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);
  const [getViewMode, getSelectedWorkspace] = useApiClientMultiWorkspaceView((s) => [
    s.getViewMode,
    s.getSelectedWorkspace,
  ]);

  const workspaceId = getContext(contextId).workspaceId;
  const workspace = useMemo(() => getSelectedWorkspace(workspaceId), [getSelectedWorkspace, workspaceId]);

  return getViewMode() === ApiClientViewMode.SINGLE ? (
    <>
      {getFileIcon(file.type)}
      <span>{file.name}</span>
    </>
  ) : (
    <div className="file-item-title-container">
      {getFileIcon(file.type)}

      <div className="file-item-title">
        <div className="workspace-name">{workspace.getState().name}</div>
        <div className="file-name">{file.name}</div>
      </div>
    </div>
  );
};

const ErrorFileItem: React.FC<{
  contextId: string;
  file: ErroredRecord;
  openErrorFile: (file: ErroredRecord) => void;
  deleteErrorFile(file: ErroredRecord): void;
}> = ({ contextId, file, openErrorFile, deleteErrorFile }) => {
  return (
    <div key={file.path} className="error-file-item">
      <ErrorFileItemTitle file={file} contextId={contextId} />

      <div className="error-file-item-actions">
        <Tooltip title="Edit file" color="var(--requestly-color-black)" placement="top">
          <MdEdit className="error-file-item-action-icon" onClick={() => openErrorFile(file)} />
        </Tooltip>
        <DeleteErrorFileButton
          onDelete={() => {
            deleteErrorFile(file);
          }}
        />
      </div>
    </div>
  );
};

export const ErrorFilesList = () => {
  const contextId = useContextId();
  const [errorFileToView, setErrorFileToView] = useState<ErroredRecord | null>(null);
  const [isErrorFileViewerModalOpen, setIsErrorFileViewerModalOpen] = useState(false);
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

  const [apiErroredRecords, environmentErroredRecords] = useErroredRecords((s) => [
    s.apiErroredRecords,
    s.environmentErroredRecords,
  ]);

  const files = useMemo(() => [...apiErroredRecords, ...environmentErroredRecords], [
    apiErroredRecords,
    environmentErroredRecords,
  ]);

  const handleDeleteErrorFile = useCallback(
    async (errorFile: ErroredRecord) => {
      const context = getContext(contextId);
      const { apiClientRecordsRepository } = context.repositories;
      const result = await apiClientRecordsRepository.deleteRecords([errorFile.path]);

      if (result.success) {
        if (errorFile.type === FileType.ENVIRONMENT) {
          forceRefreshEnvironments(context);
        } else {
          forceRefreshRecords(context);
        }

        toast.success("Error file deleted successfully");
      } else {
        notification.error({
          message: "Failed to delete error file",
          placement: "bottomRight",
        });
      }
    },
    [contextId, getContext]
  );

  const handleOpenErrorFile = (file: ErroredRecord) => {
    setErrorFileToView(file);
    setIsErrorFileViewerModalOpen(true);
  };

  if (!files.length) {
    return null;
  }

  return (
    <>
      {isErrorFileViewerModalOpen && (
        <ErrorFileViewerModal
          isOpen={isErrorFileViewerModalOpen}
          onClose={() => {
            setIsErrorFileViewerModalOpen(false);
            setErrorFileToView(null);
          }}
          errorFile={errorFileToView}
        />
      )}

      <div className="error-files-list-container">
        <ErrorListHeader />
        <div className="error-files-list-body">
          {files.map((file) => {
            return (
              <ErrorFileItem
                file={file}
                key={file.path}
                contextId={contextId}
                openErrorFile={handleOpenErrorFile}
                deleteErrorFile={handleDeleteErrorFile}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
