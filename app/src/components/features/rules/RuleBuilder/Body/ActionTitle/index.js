import React from "react";
import { Space, Row, Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./ActionTitle.css";

const ActionTitle = ({ currentlySelectedRuleConfig }) => {
  return (
    <>
      <Space>
        <Row align="middle" className="rule-header-action-title">
          <Typography.Text strong>{`${currentlySelectedRuleConfig.NAME} Rule `}</Typography.Text>

          <Tooltip
            placement="right"
            title={currentlySelectedRuleConfig?.DESCRIPTION ?? ""}
            overlayClassName="rule-type-info-tooltip"
          >
            <InfoCircleOutlined className="ml-3 rule-type-info-icon" />
          </Tooltip>
        </Row>
      </Space>
    </>
  );
};

export default ActionTitle;
