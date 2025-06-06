import { useCallback, useMemo, useState } from "react";
import { MdEdit } from "@react-icons/all-files/md/MdEdit";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { ErroredRecord, FileType } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ErrorFileViewerModal } from "../../../modals/ErrorFileViewerModal/ErrorFileViewerModal";
import { useApiClientContext } from "features/apiClient/contexts";
import "./errorFilesList.scss";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { toast } from "utils/Toast";
import { notification } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";

export const ErrorFilesList = () => {
  const [errorFileToView, setErrorFileToView] = useState<ErroredRecord | null>(null);
  const [isErrorFileViewerModalOpen, setIsErrorFileViewerModalOpen] = useState(false);
  const { apiClientRecordsRepository, forceRefreshApiClientRecords, errorFiles } = useApiClientContext();
  const { forceRefreshEnvironments, errorEnvFiles } = useEnvironmentManager();

  const files = useMemo(() => [...errorFiles, ...errorEnvFiles], [errorFiles, errorEnvFiles]);

  const handleDeleteErrorFile = async (errorFile: ErroredRecord) => {
    const result = await apiClientRecordsRepository.deleteRecords([errorFile.path]);
    if (result.success) {
      if (errorFile.type === FileType.ENVIRONMENT) {
        forceRefreshEnvironments();
      } else {
        forceRefreshApiClientRecords();
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
          {files.map((file, index) => (
            <div key={index} className="error-file-item" onClick={() => handleOpenErrorFile(file)}>
              {renderFileIcon(file)}
              <span>{file.name}</span>
              <div className="error-file-item-actions">
                <MdEdit className="error-file-item-action-icon" onClick={() => handleOpenErrorFile(file)} />
                <RiDeleteBin6Line className="error-file-item-action-icon" onClick={() => handleDeleteErrorFile(file)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
