import { Typography } from "antd";
import { RQModal } from "lib/design-system/components";
import React from "react";

export const ChangePlanRequestConfirmationModal: React.FC<{
  isOpen: boolean;
  handleToggle: () => void;
}> = ({ isOpen, handleToggle }) => {
  return (
    <RQModal open={isOpen} onCancel={handleToggle}>
      <div className="rq-modal-content">
        <Typography.Title level={4}>
          The team has been notified and they will help with the process further.
        </Typography.Title>
        <Typography.Text>Please check your email for ongoing conversations and updates.</Typography.Text>
      </div>
    </RQModal>
  );
};
