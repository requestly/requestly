import React from "react";
import { Col, Row, Switch, Tooltip } from "antd";
import "./SettingsItem.css";

interface SettingsItemProps {
  title: string;
  caption?: string;
  isActive: boolean;
  isDisable?: boolean;
  isProcessing?: boolean;
  toolTipTitle: React.ReactNode;
  onClick: (status: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  caption,
  isActive,
  onClick,
  toolTipTitle = "",
  isDisable = false,
  isProcessing = false,
}) => {
  return (
    <Row align="middle" className="w-full setting-item-container">
      <Col span={22}>
        <div className="title">{title}</div>
        {!!caption && <p className="setting-item-caption">{caption}</p>}
      </Col>
      <Col span={2}>
        <Tooltip title={toolTipTitle}>
          <Switch checked={isActive} onClick={onClick} disabled={isDisable || isProcessing} />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default SettingsItem;
