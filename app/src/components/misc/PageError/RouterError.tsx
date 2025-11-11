import { Button, Typography } from "antd";
import React, { useEffect } from "react";
import "./pageError.scss";
import LINKS from "config/constants/sub/links";
import { trackErrorBoundaryShown } from "modules/analytics/events/common/error-boundaries";
import { useRouteError } from "react-router-dom";
import { sendErrorToSentry } from "features/apiClient/components/ErrorBoundary/utils";
import { ErrorSeverity } from "errors/types";

interface Props {}

const RouterError: React.FC<Props> = () => {
  const error = useRouteError() as Error;

  useEffect(() => {
    console.log("RouterError", error);
    trackErrorBoundaryShown(error.toString(), "");
    sendErrorToSentry(error, "react-router-error-boundary", `reactRouter`, ErrorSeverity.FATAL, true, {});
  }, [error]);

  return (
    <div className="page-error-container">
      <img src={"/assets/media/components/fixing-bugs-dark.svg"} alt="error" />
      <Typography.Text type="secondary" italic className="message">
        <>
          [router-error] Something went wrong! Please contact the
          <a style={{ paddingLeft: 4 }} href={LINKS.CONTACT_US_PAGE} target="_blank" rel="noreferrer">
            support
          </a>
          .
        </>
      </Typography.Text>
      <br />
      <Button type="primary" onClick={window.location.reload}>
        Reload
      </Button>
    </div>
  );
};

export default RouterError;
