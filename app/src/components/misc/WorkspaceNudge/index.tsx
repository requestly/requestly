import React from "react";
import { Typography, Row } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import "./index.css";

export const WorkspaceNudge: React.FC = () => {
  return (
    <div className="nudge-container">
      <Row justify="end">
        <RQButton type="default" className="nudge-close-icon" iconOnly icon={<CloseOutlined />} />
      </Row>
      <div>IMAGES HERE </div>
      <Typography.Text className="display-block ">22 users from Amazon are using Requestly.</Typography.Text>
      <RQButton type="primary" className="mt-8 text-bold">
        Start Collaborating
      </RQButton>
    </div>
  );
};
