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
            <Typography.Title level={4}>Plan Change Request Submitted</Typography.Title>
            <Typography.Text>
              The Requestly team has received your request. Please check your email for updates and further
              communication regarding this request.
            </Typography.Text>
          </>
        )}
      </div>
    </RQModal>
  );
};
