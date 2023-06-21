import React from "react";
import { Row } from "antd";
import resumeRequestly from "assets/img/screenshots/resume_requestly.png";
import { WarningOutlined } from "@ant-design/icons";
import "./extensionDeactivationMessage.css";

const ExtensionDeactivationMessage = () => {
  return (
    <Row className="extension-deactivation-msg-container" align="center" justify="center">
      <div>
        <h1>
          <WarningOutlined /> Extension is paused
        </h1>
        <ol start="0">
          <li>Please resume the extension by following below steps:</li>
          <li>Open extension popup by clicking on Requestly icon on the browser's toolbar.</li>
          <li>Hover over the dropdown menu on the popup that says "Requestly paused".</li>
          <li>Click on "Resume requestly" to resume Requestly again.</li>
        </ol>

        <img width={628} height={235} src={resumeRequestly} alt="resume requestly" />
      </div>
    </Row>
  );
};

export default ExtensionDeactivationMessage;
