import React, { useCallback } from "react";
import { RenderableError } from "errors/RenderableError";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "../collectionRunnerErrors.scss";
import { RQButton } from "lib/design-system-v2/components";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";
import { useFileSelection } from "../../../RunConfigView/hooks/useFileSelection.hook";
import { trackCollectionRunnerSelectFileClicked } from "modules/analytics/events/features/apiClient";
import {
  DataFileModalViewMode,
  useDataFileModalContext,
} from "../../../RunConfigView/ParseFileModal/Modals/DataFileModalContext";
import { API_CLIENT_DOCS, LARGE_FILE_SIZE } from "features/apiClient/constants";

export class DataFileParseError extends RenderableError {
  render() {
    return <DataFileParseErrorComponent error={this} />;
  }

  getErrorHeading() {
    return "File corrupted. Test results couldn't be generated.";
  }
}

const DataFileParseErrorComponent: React.FC<{ error: DataFileParseError }> = ({ error }) => {
  const { setDataFileMetadata, setShowModal, setViewMode, parseFile } = useDataFileModalContext();

  const { openFileSelector } = useFileSelection();

  const handleFileSelection = useCallback(() => {
    trackCollectionRunnerSelectFileClicked();
    openFileSelector((file) => {
      const metadata = {
        name: file.name,
        path: file.path,
        size: file.size,
      };
      setDataFileMetadata(metadata);

      if (file.size > LARGE_FILE_SIZE) {
        setViewMode(DataFileModalViewMode.LARGE_FILE);
        setShowModal(true);
        return;
      }
      setShowModal(true);
      parseFile(file.path, true);
    });
  }, [openFileSelector, setDataFileMetadata, setShowModal, parseFile, setViewMode]);

  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="file error illustration" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{error.getErrorHeading()}</div>
          <div className="runner-error-detail">
            <span className="runner-error-message">
              The data file used for this collection appears to be damaged or unreadable. Upload a valid file and try
              running the collection again.
            </span>
          </div>
          <RQButton type="secondary" icon={<FiUpload />} onClick={handleFileSelection}>
            Upload file
          </RQButton>
        </div>

        <a
          className="documentation-link"
          href={API_CLIENT_DOCS.COLLECTION_RUNNER_DATA_FILE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdOutlineOpenInNew />
          <span>Read Troubleshooting guide</span>
        </a>
      </div>
    </>
  );
};
