import React, { ReactNode } from "react";
import { Col, Row, Switch, SwitchProps, Tooltip } from "antd";
import "./SettingsItem.css";

interface SettingsItemProps extends SwitchProps {
  title: string;
  caption?: string;
  isActive: boolean;
  toolTipTitle?: ReactNode;
  settingsBody?: ReactNode;
  onChange: (status: boolean, event?: React.MouseEvent<HTMLButtonElement>) => void;
  isChangeAble?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  caption,
  isActive,
  onChange,
  settingsBody,
  toolTipTitle = "",
  isChangeAble = true,
  ...props
}) => {
  return (
    <Row align="middle" className="w-full setting-item-container">
      <Col span={22}>
        <div className="title">{title}</div>
        {!!caption && <p className="setting-item-caption">{caption}</p>}
        {settingsBody}
      </Col>
      <Col span={2} style={{ alignSelf: "self-start", marginTop: "8px" }}>
        {isChangeAble ? (
          <Tooltip title={toolTipTitle}>
            <Switch checked={isActive} onChange={onChange} {...props} />
          </Tooltip>
        ) : (
          <Tooltip title="Enforced organisation wide. Please contact support to change.">
            <Switch defaultChecked={isActive} disabled {...props} />
          </Tooltip>
        )}
      </Col>
    </Row>
  );
};

export default SettingsItem;
