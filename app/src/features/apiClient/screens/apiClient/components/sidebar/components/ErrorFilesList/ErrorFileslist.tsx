import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ApiClientViewMode, useViewMode } from "features/apiClient/slices/workspaceView";
import { useApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { useApiErroredRecords, useEnvironmentErroredRecords } from "features/apiClient/slices/erroredRecords";
import { forceRefreshRecords } from "features/apiClient/slices/apiRecords/thunks";
import { forceRefreshEnvironments } from "features/apiClient/slices/environments/thunks";
import { useSelector } from "react-redux";
import { getWorkspaceById, dummyPersonalWorkspace } from "store/slices/workspaces/selectors";
import { RootState } from "store/types";

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
  const viewMode = useViewMode();

  return viewMode === ApiClientViewMode.SINGLE ? (
    <div className="error-files-list-header">
      <MdWarningAmber />
      ERROR FILES
    </div>
  ) : null;
};

const ErrorFileItemTitle: React.FC<{ file: ErroredRecord }> = ({ file }) => {
  const viewMode = useViewMode();
  const ctx = useApiClientFeatureContext();

  const rawWorkspace = useSelector((state: RootState) =>
    ctx.workspaceId === null ? dummyPersonalWorkspace : getWorkspaceById(ctx.workspaceId)(state)
  );
  const workspaceName = rawWorkspace?.name ?? "Unknown Workspace";

  return viewMode === ApiClientViewMode.SINGLE ? (
    <>
      {getFileIcon(file.type)}
      <span>{file.name}</span>
    </>
  ) : (
    <div className="file-item-title-container">
      {getFileIcon(file.type)}

      <div className="file-item-title">
        <div className="workspace-name">{workspaceName}</div>
        <div className="file-name">{file.name}</div>
      </div>
    </div>
  );
};

const ErrorFileItem: React.FC<{
  file: ErroredRecord;
  openErrorFile: (file: ErroredRecord) => void;
  deleteErrorFile(file: ErroredRecord): void;
}> = ({ file, openErrorFile, deleteErrorFile }) => {
  return (
    <div key={file.path} className="error-file-item">
      <ErrorFileItemTitle file={file} />

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

export const ErrorFilesList: React.FC<{ updateErrorRecordsCount?: (value: number) => void }> = ({
  updateErrorRecordsCount,
}) => {
  const [errorFileToView, setErrorFileToView] = useState<ErroredRecord | null>(null);
  const [isErrorFileViewerModalOpen, setIsErrorFileViewerModalOpen] = useState(false);

  const context = useApiClientFeatureContext();
  const { apiClientRecordsRepository, environmentVariablesRepository } = context.repositories;

  const apiErroredRecords = useApiErroredRecords();
  const environmentErroredRecords = useEnvironmentErroredRecords();

  const files = useMemo(() => [...apiErroredRecords, ...environmentErroredRecords], [
    apiErroredRecords,
    environmentErroredRecords,
  ]);

  useEffect(() => {
    updateErrorRecordsCount?.(files.length);

    return () => {
      return updateErrorRecordsCount?.(-files.length); // decrement on unmount
    };
  }, [files.length, updateErrorRecordsCount]);

  const handleDeleteErrorFile = useCallback(
    async (errorFile: ErroredRecord) => {
      const result = await apiClientRecordsRepository.deleteRecords([errorFile.path]);

      if (result.success) {
        if (errorFile.type === FileType.ENVIRONMENT) {
          await context.store
            .dispatch(
              forceRefreshEnvironments({
                repository: environmentVariablesRepository,
              }) as any
            )
            .unwrap();
        } else {
          await context.store
            .dispatch(
              forceRefreshRecords({
                repository: apiClientRecordsRepository,
              }) as any
            )
            .unwrap();
        }

        toast.success("Error file deleted successfully");
      } else {
        notification.error({
          message: "Failed to delete error file",
          placement: "bottomRight",
        });
      }
    },
    [apiClientRecordsRepository, environmentVariablesRepository, context]
  );

  const handleOpenErrorFile = (file: ErroredRecord) => {
    setErrorFileToView(file);
    setIsErrorFileViewerModalOpen(true);
  };

  const onCloseErrorFileViewerModalOpen = useCallback(() => {
    setIsErrorFileViewerModalOpen(false);
    setErrorFileToView(null);
  }, []);

  if (!files.length) {
    return null;
  }

  return (
    <>
      {isErrorFileViewerModalOpen && errorFileToView && (
        <ErrorFileViewerModal
          errorFile={errorFileToView}
          isOpen={isErrorFileViewerModalOpen}
          onClose={onCloseErrorFileViewerModalOpen}
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
