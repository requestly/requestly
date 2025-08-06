import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Modal, Col } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { BillingTeamCard } from "../TeamCard";
import { trackJoinBillingTeamReminderViewed } from "features/settings/analytics";
import APP_CONSTANTS from "config/constants";
import { openEmailClientWithDefaultEmailBody } from "utils/Misc";
import { globalActions } from "store/slices/global/slice";
import { RQButton } from "lib/design-system-v2/components";
import LINKS from "config/constants/sub/links";
import "../../index.scss";

export const RequestBillingTeamAccessReminder = () => {
  const dispatch = useDispatch();
  const joinTeamReminder = useFeatureValue("join_team_reminder", null);
  const isDomainBlocked = useFeatureValue("blocked_commercial_license_domain", false);
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosable, setIsModalClosable] = useState(true);

  const emailSubject = "Request a new Billing Team";
  const emailBody = `Hey Requestly Team\n\n We'd like to setup a new Billing Team. Could you please assist with the next step here?\n\nThanks\n${user?.details?.profile?.displayName}`;

  const availableBillingTeams = useMemo(() => {
    if (isDomainBlocked) {
      return [];
    }
    if (billingTeams) {
      return billingTeams.filter(
        (team) =>
          Object.keys(team.members).length > 1 &&
          !team?.isAcceleratorTeam &&
          (team?.subscriptionDetails?.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE ||
            team?.subscriptionDetails?.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.PAST_DUE)
      );
    }
    return [];
  }, [billingTeams, isDomainBlocked]);

  useEffect(() => {
    if (isModalVisible) {
      trackJoinBillingTeamReminderViewed();
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (joinTeamReminder && !user.details?.isPremium && user.loggedIn) {
      const lastReminderDate = localStorage.getItem(APP_CONSTANTS.STORAGE.LOCAL_STORAGE.LAST_REMINDER_DATE);
      const currentDate = new Date();
      const reminderStartDate = new Date(joinTeamReminder.startDate);
      const persistenceDate = new Date(joinTeamReminder.persistenceDate);

      if (currentDate >= persistenceDate) {
        setIsModalClosable(false);
        setTimeout(() => {
          setIsModalVisible(true);
        }, 4000);
        return;
      }

      if (lastReminderDate === currentDate.toISOString().split("T")[0]) {
        return;
      }
      if (currentDate >= reminderStartDate) {
        setTimeout(() => {
          setIsModalVisible(true);
        }, 4000);
      }
    } else setIsModalVisible(false);
  }, [joinTeamReminder, user.details?.isPremium, user.loggedIn]);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    localStorage.setItem(
      APP_CONSTANTS.STORAGE.LOCAL_STORAGE.LAST_REMINDER_DATE,
      new Date().toISOString().split("T")[0]
    );
  }, []);

  const handleOpenPricingModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal" }));
  };

  return (
    <Modal
      maskStyle={{
        backgroundColor: !isModalClosable ? "#111111" : "auto",
      }}
      keyboard={false}
      maskClosable={false}
      closable={false}
      wrapClassName="custom-rq-modal"
      width={700}
      open={isModalVisible}
      onCancel={handleModalClose}
      centered
      title="Get a license to continue using Requestly"
      footer={null}
    >
      {availableBillingTeams?.length ? (
        <>
          <Col>
            <div className="text-white">
              {availableBillingTeams?.length > 1 ? (
                <>
                  To continue using Requestly, you need a license. We have found the following billing teams in your
                  Organization. If you are part of one of these teams, you can request access to a license.
                </>
              ) : (
                <>
                  To continue using Requestly, you need a license. We have found the following billing team in your
                  Organization. If you are part of this team, you can request access to a license.
                </>
              )}
            </div>
            <div className="mt-8 billing-teams-card-wrapper">
              {availableBillingTeams?.map((team: BillingTeamDetails) => (
                <BillingTeamCard key={team.id} team={team} />
              ))}
            </div>
          </Col>
          <div className="text-white mt-24">
            You can purchase individual license for yourself{" "}
            <a href="#" onClick={handleOpenPricingModal}>
              here
            </a>{" "}
            or set up team billing by contacting us at{" "}
            <a href={openEmailClientWithDefaultEmailBody("enterprise.support@requestly.io", emailSubject, emailBody)}>
              enterprise.support@requestly.io
            </a>
            . For any queries, you can schedule a call with our team{" "}
            <a href={LINKS.BOOK_A_DEMO} target="_blank" rel="noreferrer">
              here
            </a>
            .
          </div>
        </>
      ) : (
        <>
          <div className="text-white">
            Get a license to continue using Requestly To continue using Requestly, you need a license. You can purchase
            licenses directly or set up team billing by contacting us at{" "}
            <a href={openEmailClientWithDefaultEmailBody("enterprise.support@requestly.io", emailSubject, emailBody)}>
              enterprise.support@requestly.io
            </a>
            . For any queries, you can schedule a call with our team{" "}
            <a href={LINKS.BOOK_A_DEMO} target="_blank" rel="noreferrer">
              here
            </a>
            .
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <RQButton className="mt-8" style={{ marginRight: "14px" }} onClick={handleOpenPricingModal} type="primary">
              See plans
            </RQButton>
          </div>
        </>
      )}
    </Modal>
  );
};
