import React, { useState } from "react";
import { MdEdit } from "@react-icons/all-files/md/MdEdit";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { ErrorFile } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ErrorFileViewerModal } from "../../../modals/ErrorFileViewerModal/ErrorFileViewerModal";
import { useApiClientContext } from "features/apiClient/contexts";
import { toast } from "utils/Toast";
import "./errorFilesList.scss";

interface ErrorFilesListProps {
  errorFiles: ErrorFile[];
}

export const ErrorFilesList: React.FC<ErrorFilesListProps> = ({ errorFiles }) => {
  const [errorFileToView, setErrorFileToView] = useState<ErrorFile | null>(null);
  const [isErrorFileViewerModalOpen, setIsErrorFileViewerModalOpen] = useState(false);
  const { apiClientRecordsRepository } = useApiClientContext();

  const handleDeleteErrorFile = async (errorFile: ErrorFile) => {
    const result = await apiClientRecordsRepository.deleteRecords([errorFile.path]);
    if (result.success) {
      toast.success("Error file deleted successfully");
    } else {
      toast.error("Failed to delete error file");
    }
  };
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
        <div className="error-files-list-header">ERROR FILES</div>
        {errorFiles.map((file) => (
          <div key={file.name} className="error-file-item">
            <span>
              <MdWarningAmber className="error-file-icon" /> <span>{file.name}</span>
            </span>
            <div className="error-file-item-actions">
              <MdEdit
                className="error-file-item-action-icon"
                onClick={() => {
                  setErrorFileToView(file);
                  setIsErrorFileViewerModalOpen(true);
                }}
              />
              <RiDeleteBin6Line className="error-file-item-action-icon" onClick={() => handleDeleteErrorFile(file)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
