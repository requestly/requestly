import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, Col } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { getCompanyNameFromEmail } from "utils/FormattingHelper";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { BillingTeamDetails } from "../../types";
import { BillingTeamCard } from "./components/TeamCard";
import { trackRequestBillingTeamAccessModalViewed } from "features/settings/analytics";
import "./index.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBillingTeamAccessModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const user = useSelector(getUserAuthDetails);
  const companyName = getCompanyNameFromEmail(user?.details?.profile?.email);
  const billingTeams = useSelector(getAvailableBillingTeams);

  useEffect(() => {
    if (isOpen) {
      trackRequestBillingTeamAccessModalViewed();
    }
  }, [isOpen]);

  return (
    <Modal
      wrapClassName="custom-rq-modal"
      width={600}
      open={isOpen}
      onCancel={onClose}
      centered
      title="Free plan restriction"
      footer={null}
    >
      <div className="text-white">
        Dear {companyName} user, Free Plan doesn't allow commercial usage (using Requestly at work). You can either join
        one of the existing billing teams or ask your manager to set up a new one.
      </div>
      <Col>
        <div className="title mt-24">Your organization billing teams:</div>
        <div className="mt-8 billing-teams-card-wrapper">
          {billingTeams?.map((team: BillingTeamDetails, index: number) => (
            <BillingTeamCard key={index} team={team} />
          ))}
        </div>
      </Col>
      <div className="text-white text-bold mt-24">
        We also have a Slack channel 'Requestly-feedback-support' that you can join and ask any questions there.
      </div>
      <div className="text-white text-bold mt-8">
        Feel free to ping “Sachin” on Slack or drop us an email at{" "}
        <a className="external-link" href="mailto:contact@requestly.io">
          contact@requestly.io
        </a>
      </div>
    </Modal>
  );
};
