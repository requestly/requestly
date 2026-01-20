import React from "react";
import { Alert } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { NativeError } from "errors/NativeError";
import { isDesktopMode } from "utils/AppUtils";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { ErrorDetails } from "./ErrorDetails";
import "./ErrorScreen.scss";

interface ErrorScreenProps {
  error: NativeError | Error;
  resetError: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, resetError }) => {
  return (
    <div className="api-client-error-boundary-view">
      <div className="api-client-error-boundary-content">
        <ErrorDetails error={error} />
        {isDesktopMode() ? <Alert type="warning" message="Try restarting the app to fix this issue." /> : null}
        <div className="error-boundary__contact">
          If the issue persists, contact <a href="mailto:contact@requestly.io">support</a>
        </div>
        <div className="error-boundary__actions">
          <RQButton
            onClick={() => {
              getTabServiceActions().resetTabs(true);
              window.location.reload();
            }}
          >
            Reload
          </RQButton>
          <RQButton type="primary" onClick={resetError}>
            Go Back
          </RQButton>
        </div>
      </div>
    </div>
  );
};

