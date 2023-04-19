import React from "react";
import { Button, Divider, Popconfirm, Row, Space } from "antd";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

interface SettingsHeaderProps {
  handleUpdateClick: () => void;
  confirmationOptions?: {
    shouldConfirm?: Boolean;
    message: string;
    confirmCTAText?: string;
    handleConfirmDeny?: () => void;
  };
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ handleUpdateClick, confirmationOptions }) => {
  const navigate = useNavigate();

  const handleCancelClick = () => navigate("/");

  return (
    <Row justify="end" className="settings-action">
      <Space align="center" size="small">
        {confirmationOptions?.shouldConfirm ? (
          isFeatureCompatible(FEATURES.DESKTOP_USER_PREFERENCES) ? (
            <Popconfirm
              placement="topLeft"
              title={confirmationOptions.message}
              onConfirm={handleUpdateClick}
              onCancel={confirmationOptions.handleConfirmDeny}
              okText={confirmationOptions.confirmCTAText ? confirmationOptions.confirmCTAText : "Yes"}
              cancelText="No"
            >
              <Button type="primary">Update</Button>
            </Popconfirm>
          ) : (
            <Button disabled type="primary" onClick={handleUpdateClick}>
              Update
            </Button>
          )
        ) : (
          <Button type="primary" onClick={handleUpdateClick}>
            Update
          </Button>
        )}
        <RQButton type="default" onClick={handleCancelClick}>
          Cancel
        </RQButton>
      </Space>
      <Divider dashed />
    </Row>
  );
};

export default SettingsHeader;
