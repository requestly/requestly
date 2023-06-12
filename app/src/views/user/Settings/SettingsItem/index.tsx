import React from "react";
import { Col, Row, Switch, SwitchProps, Tooltip } from "antd";
import "./SettingsItem.css";

interface SettingsItemProps extends SwitchProps {
  title: string;
  caption?: string;
  isActive: boolean;
  toolTipTitle: React.ReactNode;
  onChange: (status: boolean, event?: React.MouseEvent<HTMLButtonElement>) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  caption,
  isActive,
  onChange,
  toolTipTitle = "",
  ...props
}) => {
  return (
    <Row align="middle" className="w-full setting-item-container">
      <Col span={22}>
        <div className="title">{title}</div>
        {!!caption && <p className="setting-item-caption">{caption}</p>}
      </Col>
      <Col span={2}>
        <Tooltip title={toolTipTitle}>
          <Switch checked={isActive} onChange={onChange} {...props} />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default SettingsItem;
