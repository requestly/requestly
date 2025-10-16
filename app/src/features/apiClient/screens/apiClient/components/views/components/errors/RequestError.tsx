import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";
import ApiClientFileMissingError from "./APIClientFileMissingError";

export const RequestError: React.FC<{ error: RQAPI.ExecutionError; onRetry: () => void }> = (props) => {
  if (props.error.type === RQAPI.ApiClientErrorType.MISSING_FILE) {
    const isMultipartFormError = props.error.context === "multipart_form";
    const isRunnerError = props.error.context === "runner_data_file";

    return (
      <ApiClientFileMissingError
        imageUrl="/assets/media/apiClient/file-error.svg"
        error={props.error}
        onRetry={props.onRetry}
        showTitle={{
          flag: true,
          title: isMultipartFormError
            ? "Request not sent — file missing"
            : isRunnerError
            ? "File missing. We couldn’t run the test."
            : "File missing",
        }}
        showButton={isRunnerError ? false : true}
      />
    );
  }

  return <ApiClientErrorPlaceholder imageUrl="/assets/media/apiClient/request-error.svg" {...props} />;
};
