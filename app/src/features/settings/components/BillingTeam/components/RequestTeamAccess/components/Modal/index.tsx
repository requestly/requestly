import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, Col } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { BillingTeamCard } from "../TeamCard";
import { trackRequestBillingTeamAccessModalViewed } from "features/settings/analytics";
import APP_CONSTANTS from "config/constants";
import "../../index.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBillingTeamAccessModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const billingTeams = useSelector(getAvailableBillingTeams);

  useEffect(() => {
    if (isOpen) {
      trackRequestBillingTeamAccessModalViewed();
    }
  }, [isOpen]);

  return (
    <Modal
      maskClosable={false}
      wrapClassName="custom-rq-modal"
      width={600}
      open={isOpen}
      onCancel={onClose}
      centered
      title="Your Organization Billing Teams"
      footer={null}
    >
      <Col>
        <div className="mt-8 billing-teams-card-wrapper">
          {billingTeams?.map((team: BillingTeamDetails) => {
            if (team?.subscriptionDetails?.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE) {
              return <BillingTeamCard key={team.id} team={team} />;
            }
            return null;
          })}
        </div>
      </Col>
      <div className="text-white text-bold mt-24">
        If you have any questions, please write to us at{" "}
        <a className="external-link" href="mailto:enterprise.support@requestly.io">
          enterprise.support@requestly.io
        </a>
      </div>
    </Modal>
  );
};
