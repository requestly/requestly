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
            <Typography.Title level={4}>Please confirm your plan change request in the Stripe portal.</Typography.Title>
            <Typography.Text>
              The team has been notified. Please check your email for ongoing conversations and updates.
            </Typography.Text>
          </>
        )}
      </div>
    </RQModal>
  );
};
