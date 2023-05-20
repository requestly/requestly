import { Typography } from "antd";
import React, { ReactElement } from "react";
import img from "../../../assets/images/illustrations/fixing-bugs-dark.svg";
import "./pageError.scss";
import LINKS from "config/constants/sub/links";

interface Props {
  message?: ReactElement;
}

const PageError: React.FC<Props> = ({ message }) => {
  return (
    <div className="page-error-container">
      <img src={img} alt="error" />
      <Typography.Text type="secondary" italic className="message">
        {message ?? (
          <>
            Something went wrong! Please contact the
            <a style={{ paddingLeft: 4 }} href={LINKS.CONTACT_US_PAGE} target="_blank" rel="noreferrer">
              support
            </a>
            .
          </>
        )}
      </Typography.Text>
    </div>
  );
};

export default PageError;
