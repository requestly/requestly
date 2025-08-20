import { useCallback, useMemo, useState } from "react";
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
import { useCommand } from "features/apiClient/commands";
import { useApiClientRepository } from "features/apiClient/contexts/meta";

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

export const ErrorFilesList = () => {
  const [errorFileToView, setErrorFileToView] = useState<ErroredRecord | null>(null);
  const [isErrorFileViewerModalOpen, setIsErrorFileViewerModalOpen] = useState(false);

  const { apiClientRecordsRepository } = useApiClientRepository();
  const [apiErroredRecords, environmentErroredRecords] = useErroredRecords((s) => [
    s.apiErroredRecords,
    s.environmentErroredRecords,
  ]);
  const {
    env: { forceRefreshEnvironments },
    api: { forceRefreshRecords },
  } = useCommand();

  const files = useMemo(() => [...apiErroredRecords, ...environmentErroredRecords], [
    apiErroredRecords,
    environmentErroredRecords,
  ]);

  const handleDeleteErrorFile = async (errorFile: ErroredRecord) => {
    const result = await apiClientRecordsRepository.deleteRecords([errorFile.path]);
    if (result.success) {
      if (errorFile.type === FileType.ENVIRONMENT) {
        forceRefreshEnvironments();
      } else {
        forceRefreshRecords();
      }
      toast.success("Error file deleted successfully");
    } else {
      notification.error({
        message: "Failed to delete error file",
        placement: "bottomRight",
      });
    }
  };

  const handleOpenErrorFile = (file: ErroredRecord) => {
    setErrorFileToView(file);
    setIsErrorFileViewerModalOpen(true);
  };

  const renderFileIcon = useCallback((file: ErroredRecord) => {
    if (file.type === FileType.ENVIRONMENT) {
      return <CgStack className="error-file-icon" />;
    }
    return <MdOutlineSyncAlt className="error-file-icon" />;
  }, []);

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
        <div className="error-files-list-header">
          <MdWarningAmber />
          ERROR FILES
        </div>
        <div className="error-files-list-body">
          {files.map((file) => (
            <div key={file.path} className="error-file-item">
              {renderFileIcon(file)}
              <span>{file.name}</span>
              <div className="error-file-item-actions">
                <Tooltip title="Edit file" color="var(--requestly-color-black)" placement="top">
                  <MdEdit className="error-file-item-action-icon" onClick={() => handleOpenErrorFile(file)} />
                </Tooltip>
                <DeleteErrorFileButton
                  onDelete={() => {
                    handleDeleteErrorFile(file);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
