import { Button, Typography } from "antd";
import React, { useEffect } from "react";
import img from "../../../assets/images/illustrations/fixing-bugs-dark.svg";
import "./pageError.scss";
import LINKS from "config/constants/sub/links";
import { trackErrorBoundaryShown } from "modules/analytics/events/common/error-boundaries";

interface Props {
  error: any;
  componentStack?: any;
  resetError?: () => void;
}

const PageError: React.FC<Props> = ({ error, componentStack = "", resetError = null }) => {
  useEffect(() => {
    trackErrorBoundaryShown(error.toString(), componentStack.toString());
  }, [error, componentStack]);

  return (
    <div className="page-error-container">
      <img src={img} alt="error" />
      <Typography.Text type="secondary" italic className="message">
        <>
          Something went wrong! Please contact the
          <a style={{ paddingLeft: 4 }} href={LINKS.CONTACT_US_PAGE} target="_blank" rel="noreferrer">
            support
          </a>
          .
        </>
      </Typography.Text>
      <br />
      {resetError ? (
        <Button type="primary" onClick={resetError}>
          Reload
        </Button>
      ) : null}
    </div>
  );
};

export default PageError;
