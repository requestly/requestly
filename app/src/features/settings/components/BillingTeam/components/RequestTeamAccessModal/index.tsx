import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { Modal, Col } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { BillingTeamDetails } from "../../types";
import { BillingTeamCard } from "./components/TeamCard";
import { trackRequestBillingTeamAccessModalViewed } from "features/settings/analytics";
import APP_CONSTANTS from "config/constants";
import "./index.scss";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  isReminder?: boolean;
}

export const RequestBillingTeamAccessModal: React.FC<Props> = ({ isOpen, onClose, isReminder = false }) => {
  const joinTeamReminder = useFeatureValue("join_team_reminder", null);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosable, setIsModalClosable] = useState(true);

  useEffect(() => {
    if (isOpen || isModalVisible) {
      trackRequestBillingTeamAccessModalViewed();
    }
  }, [isOpen]);

  useEffect(() => {
    if (joinTeamReminder && isReminder) {
      const lastReminderDate = localStorage.getItem("lastReminderDate");
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
      const reminderStartDate = new Date(joinTeamReminder.startDate);
      const persistanceDate = new Date(joinTeamReminder.persistanceDate);

      if (lastReminderDate === formattedCurrentDate) {
        return;
      }
      if (!lastReminderDate || currentDate >= reminderStartDate) {
        setIsModalVisible(true);
      }

      if (currentDate >= persistanceDate) {
        setIsModalClosable(false);
      }
    }
  }, [joinTeamReminder, isReminder]);

  const handleModalClose = () => {
    setIsModalVisible(false);
    localStorage.setItem("lastReminderDate", new Date().toISOString().slice(0, 10));
    onClose?.();
  };

  return (
    <Modal
      maskStyle={{
        backgroundColor: !isModalClosable ? "#000000E6" : "auto",
      }}
      maskClosable={isModalClosable}
      closable={isModalClosable}
      wrapClassName="custom-rq-modal"
      width={600}
      open={isOpen ?? isModalVisible}
      onCancel={handleModalClose}
      centered
      title={isReminder ? "Join a Billing Team" : "Your Organization Billing Teams"}
      footer={null}
    >
      <Col>
        {isReminder && (
          <div className="text-white">
            To continue using Requestly, you need a license. We have found the following billing teams in your
            Organization. If you are part of one of these teams, you can request to join them or Create a new Billing
            Team.
          </div>
        )}

        <div className="mt-8 billing-teams-card-wrapper">
          {billingTeams?.map((team: BillingTeamDetails, index: number) => {
            if (team?.subscriptionDetails?.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE) {
              return <BillingTeamCard key={index} team={team} />;
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
