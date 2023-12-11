import React from "react";
import { Typography } from "antd";
import PageLoader from "components/misc/PageLoader";
import { RQModal } from "lib/design-system/components";

export const ChangePlanRequestConfirmationModal: React.FC<{
  isOpen: boolean;
  handleToggle: () => void;
  isLoading?: boolean;
}> = ({ isOpen, handleToggle, isLoading }) => {
  return (
    <RQModal open={isOpen} onCancel={handleToggle}>
      <div className="rq-modal-content">
        {isLoading ? (
          <PageLoader />
        ) : (
          <>
            <Typography.Title level={4}>
              The team has been notified and they will help with the process further.
            </Typography.Title>
            <Typography.Text>Please check your email for ongoing conversations and updates.</Typography.Text>
          </>
        )}
      </div>
    </RQModal>
  );
};
