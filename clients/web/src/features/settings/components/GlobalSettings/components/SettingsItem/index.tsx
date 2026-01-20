import React, { ReactNode } from "react";
import { Col, Popconfirm, PopconfirmProps, Row, Switch, SwitchProps, Tooltip } from "antd";
import "./SettingsItem.css";

interface SettingsItemProps extends SwitchProps {
  title: string;
  caption?: ReactNode;
  isActive: boolean;
  toolTipTitle?: ReactNode;
  settingsBody?: ReactNode;
  onChange: (status: boolean, event?: React.MouseEvent<HTMLButtonElement>) => void;
  isChangeAble?: boolean;
  isTogglable?: boolean;
  confirmation?: PopconfirmProps;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  caption,
  isActive,
  onChange,
  settingsBody,
  toolTipTitle = "",
  isChangeAble = true,
  isTogglable = true,
  confirmation = null,
  ...props
}) => {
  return (
    <Row align="middle" className="w-full setting-item-container">
      <Col span={22}>
        <div className="title">{title}</div>
        {!!caption && <p className="setting-item-caption">{caption}</p>}
        {settingsBody}
      </Col>
      {isTogglable && (
        <Col span={2} style={{ alignSelf: "self-start", marginTop: "8px" }}>
          {isChangeAble ? (
            <Tooltip title={toolTipTitle} color="#000">
              {confirmation ? (
                <Popconfirm {...confirmation}>
                  <Switch checked={isActive} onChange={onChange} {...props} />
                </Popconfirm>
              ) : (
                <Switch checked={isActive} onChange={onChange} {...props} />
              )}
            </Tooltip>
          ) : (
            <Tooltip title="Enforced organisation wide. Please contact support to change.">
              <Switch defaultChecked={isActive} disabled {...props} />
            </Tooltip>
          )}
        </Col>
      )}
    </Row>
  );
};

export default SettingsItem;
