import React from "react";
import { Col, Row, Switch } from "antd";
import "./SettingsItem.css";

interface SettingsItemProps {
  title: string;
  caption?: string;
  isActive: boolean;
  isProcessing?: boolean;
  onClick: (status: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  caption,
  isActive,
  onClick,
  isProcessing = false,
}) => {
  return (
    <Row align="middle" className="w-full setting-item-container">
      <Col span={22}>
        <div className="title">{title}</div>
        {!!caption && <p className="setting-item-caption">{caption}</p>}
      </Col>
      <Col span={2}>
        <Switch checked={isActive} onClick={onClick} disabled={isProcessing} />
      </Col>
    </Row>
  );
};

export default SettingsItem;
