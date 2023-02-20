import { Typography } from "antd";
import React from "react";
import img from "../../../assets/images/illustrations/fixing-bugs-dark.svg";
import "./pageError.scss";

const PageError = ({ message = "Something went wrong" }) => {
  return (
    <div className="page-error-container">
      <img src={img} alt="error" />
      <Typography.Text type="secondary" italic className="message">
        {message}
      </Typography.Text>
    </div>
  );
};

export default PageError;
