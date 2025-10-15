import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./testsRunningLoader.scss";

export const TestsRunningLoader: React.FC = () => {
  return (
    <div className="testsRunningLoader">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 16, color: "var(--requestly-color-text-placeholder)" }} spin />}
      />
      <div className="message">Tests running...</div>
    </div>
  );
};
