import React from "react";
import { Spin } from "antd";
import "./pageLoader.scss";

const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="page-loader-container">
      <Spin size="large" tip={message} />
    </div>
  );
};

export default PageLoader;
