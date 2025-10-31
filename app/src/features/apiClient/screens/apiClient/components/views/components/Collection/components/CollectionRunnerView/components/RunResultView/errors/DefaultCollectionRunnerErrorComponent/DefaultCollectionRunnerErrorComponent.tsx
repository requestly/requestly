import React from "react";
import "../CollectionRunnerDataFileError/collectionRunnerDataFileError.scss";
interface Props {
  error: Error;
}
export const DefaultCollectionRunnerError: React.FC<Props> = ({ error }) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="Error card" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{"Could not run collection"}</div>
          <div className="default-file-error-container">
            <code className="stack-trace">{error.stack}</code>
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultCollectionRunnerError;
