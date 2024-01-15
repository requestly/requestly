import React from "react";
import { Col } from "antd";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  return (
    <div className="settings-index">
      <Col className="settings-sidebar">SIDEBAR HERE</Col>
      <Col className="settings-content-wrapper">
        <Col className="settings-content">CONTENT HERE</Col>
      </Col>
    </div>
  );
};

export default SettingsIndex;
