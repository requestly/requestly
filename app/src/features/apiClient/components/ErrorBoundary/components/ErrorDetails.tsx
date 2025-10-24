import React from "react";
import { Collapse } from "antd";
import { RenderableError } from "errors/RenderableError";
import { NativeError } from "errors/NativeError";
import { getErrorPresentationDetails } from "../utils";
import "./ErrorDetails.scss";

interface ErrorDetailsProps {
  error: NativeError | Error;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({ error }) => {
  return (
    <>
      <img className="error-boundary__icon" src="/assets/media/apiClient/request-error.svg" alt="Error screen" />
      <div className="api-client-error-boundary-content__error-details">
        <div className="error-boundary__header">{getErrorPresentationDetails(error).heading}</div>
        <div className="error-boundary__error-message">
          {error.stack ? (
            <Collapse bordered={false} className="error-boundary__collapse">
              <Collapse.Panel header={<code>{getErrorPresentationDetails(error).subheading}</code>} key="error-details">
                <pre className="error-boundary__stacktrace">{error.stack}</pre>
              </Collapse.Panel>
            </Collapse>
          ) : (
            <code>{getErrorPresentationDetails(error).subheading}</code>
          )}
        </div>
      </div>
      {
        // Render Custom Error Details for RenderableError
        error instanceof RenderableError ? (
          <div className="error-boundary__troubleshoot">
            <div className="error-boundary__troubleshoot-header">Troubleshoot</div>
            <div className="error-boundary__troubleshoot-content">{error.render()}</div>
          </div>
        ) : null
      }
    </>
  );
};

