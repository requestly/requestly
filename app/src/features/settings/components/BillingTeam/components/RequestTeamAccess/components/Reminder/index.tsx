import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getUserAuthDetails } from "store/selectors";
import { Modal, Col } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { BillingTeamCard } from "../TeamCard";
import { trackJoinBillingTeamReminderViewed } from "features/settings/analytics";
import APP_CONSTANTS from "config/constants";
import { openEmailClientWithDefaultEmailBody } from "utils/Misc";
import "../../index.scss";

export const RequestBillingTeamAccessReminder = () => {
  const joinTeamReminder = useFeatureValue("join_team_reminder", null);
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosable, setIsModalClosable] = useState(true);

  const emailSubject = "Request a new Billing Team";
  const emailBody = `Hey Requestly Team\n\n We'd like to setup a new Billing Team. Could you please assist with the next step here?\n\nThanks\n${user?.details?.profile?.displayName}`;

  useEffect(() => {
    if (isModalVisible) {
      trackJoinBillingTeamReminderViewed();
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (joinTeamReminder) {
      const lastReminderDate = localStorage.getItem(APP_CONSTANTS.STORAGE.LOCAL_STORAGE.LAST_REMINDER_DATE);
      const currentDate = new Date();
      const reminderStartDate = new Date(joinTeamReminder.startDate);
      const persistenceDate = new Date(joinTeamReminder.persistenceDate);

      if (currentDate >= persistenceDate) {
        setIsModalClosable(false);
        setIsModalVisible(true);
        return;
      }

      if (lastReminderDate === currentDate.toISOString().split("T")[0]) {
        return;
      }
      if (currentDate >= reminderStartDate) {
        setIsModalVisible(true);
      }
    }
  }, [joinTeamReminder]);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    localStorage.setItem(
      APP_CONSTANTS.STORAGE.LOCAL_STORAGE.LAST_REMINDER_DATE,
      new Date().toISOString().split("T")[0]
    );
  }, []);

  return (
    <Modal
      maskStyle={{
        backgroundColor: !isModalClosable ? "#000000" : "auto",
      }}
      maskClosable={false}
      closable={isModalClosable}
      wrapClassName="custom-rq-modal"
      width={600}
      open={isModalVisible}
      onCancel={handleModalClose}
      centered
      title="Join a Billing Team"
      footer={null}
    >
      <Col>
        <div className="text-white">
          To continue using Requestly, you need a license. We have found the following billing teams in your
          Organization. If you are part of one of these teams, you can request to join them or create a new Billing
          Team.
        </div>

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
        Want to setup a new billing team? please write to us at{" "}
        <a
          className="external-link"
          href={openEmailClientWithDefaultEmailBody("enterprise.support@requestly.io", emailSubject, emailBody)}
        >
          enterprise.support@requestly.io
        </a>
      </div>
    </Modal>
  );
};
