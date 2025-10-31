import React, { useCallback } from "react";
import { RenderableError } from "errors/RenderableError";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "./collectionRunnerDataFileError.scss";
import { API_CLIENT_DOCS } from "features/apiClient/constants";
import { useCollectionRunnerFileSelection } from "../../../RunConfigView/hooks/useCollectionRunnerFileSelection.hook";
import { trackCollectionRunnerSelectFileClicked } from "modules/analytics/events/features/apiClient";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";

export const CollectionRunnerDataFileError: React.FC<{ error: RenderableError }> = ({ error }) => {
  const { openFileSelector } = useCollectionRunnerFileSelection();

  const handleFileSelection = useCallback(() => {
    trackCollectionRunnerSelectFileClicked();
    openFileSelector();
  }, [openFileSelector]);

  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="file error illustration" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{error.getErrorHeading()}</div>
          <div className="runner-error-container">
            <span className="runner-error-message">{error.message}</span>
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
