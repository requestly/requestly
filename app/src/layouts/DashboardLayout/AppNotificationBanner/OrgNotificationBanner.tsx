import React from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsOrgBannerDismissed, getUserAuthDetails } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import "./appNotificationBanner.scss";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { Avatar, Divider, Row, Space, Typography } from "antd";
import { parseGravatarImage } from "utils/Misc";
import { toast } from "utils/Toast";
import { trackTeamPlanBannerClicked, trackTeamPlanBannerViewed } from "modules/analytics/events/common/teams";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { actions } from "store";
import { useDispatch } from "react-redux";

const UsersModal: React.FC<{
  users: any[];
  isModalOpen: boolean;
  onCancel: () => void;
  showSuccess: boolean;
  sendRequestEmail: () => void;
}> = ({ users, isModalOpen, onCancel, showSuccess, sendRequestEmail }) => {
  if (users.length === 0) return null;

  return (
    <RQModal open={isModalOpen} onCancel={onCancel} width={100}>
      <div className="rq-modal-content">
        {showSuccess ? (
          <div className="title">
            <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
            <div className="mt-8">
              Thank you for showing interest in the Requestly team plan.
              <br />
              We will reach out to you shortly via email.
            </div>
          </div>
        ) : (
          <>
            <Row justify={"space-between"}>
              <Typography.Title level={4}>
                {users.length} <span className="text-capitalize">{users[0]?.domain?.split(".")[0]}</span> users{" "}
              </Typography.Title>
              <RQButton
                type="primary"
                onClick={() => {
                  trackTeamPlanBannerClicked("get_subscription", "view_users_modal");
                  sendRequestEmail();
                }}
              >
                Get a team subscription
              </RQButton>
            </Row>
            <Divider />
            <div className="user-list">
              {users.map((user) => (
                <div className="user-list-card display-flex">
                  <Avatar
                    size={28}
                    shape="square"
                    className="mr-8"
                    src={parseGravatarImage(
                      user.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                    )}
                  />
                  <span className="text-bold">{user?.email}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </RQModal>
  );
};

export const OrgNotificationBanner = () => {
  const dispatch = useDispatch();

  const isOrgBannerDismissed = useSelector(getIsOrgBannerDismissed) ?? false;
  const user = useSelector(getUserAuthDetails);
  const userEmail = user?.details?.profile?.email;
  const isUserSubscribed = user?.details?.isPremium && user?.details?.planDetails?.status !== "trialing";

  const [userDetails, setUserDetails] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const orgBannerConfig = useFeatureValue("team_plan_banner", null);

  const handleCloseBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(actions.updateIsOrgBannerDismissed(true));
  };

  const sendRequestEmail = useCallback(() => {
    const sendTeamSubscriptionRequestEmail = httpsCallable(
      getFunctions(),
      "internalNotifications-sendTeamSubscriptionRequestEmail"
    );
    sendTeamSubscriptionRequestEmail({ userCount: userDetails.length })
      .then(() => {
        setShowSuccess(true);
      })
      .catch(() => toast.error("Error while sending email. Please try again later."));
  }, [userDetails.length]);

  useEffect(() => {
    if (isOrgBannerDismissed || isUserSubscribed || !orgBannerConfig) {
      return;
    }

    if (isCompanyEmail(userEmail)) {
      const getOrganizationUsers = httpsCallable(getFunctions(), "users-getOrganizationUsers");
      getOrganizationUsers({ domain: getDomainFromEmail(userEmail) }).then((result: any) => {
        setUserDetails(result.data.users);
        if (result.data.users.length > 0 && orgBannerConfig && !isOrgBannerDismissed) {
          trackTeamPlanBannerViewed();
        }
      });
    }
  }, [isOrgBannerDismissed, isUserSubscribed, orgBannerConfig, userEmail]);

  if (isOrgBannerDismissed || !orgBannerConfig || userDetails.length === 0) return null;

  return (
    <>
      <span className="app-banner" style={{ backgroundColor: "#621F56" }}>
        <Space size="middle">
          <div className="app-banner-text">
            <span className="text-bold">{`${userDetails.length} users `}</span>from
            <span className="text-bold text-capitalize">{` ${userDetails[0]?.domain?.split(".")[0]}`}</span>
            {` are using Requestly and are facing limits. We offer team plan to buy licenses for the entire team.`}
          </div>
          <RQButton
            onClick={() => {
              trackTeamPlanBannerClicked("view_users", "banner");
              setOpenModal(true);
            }}
            className="view-users-button"
          >
            View Users
          </RQButton>
          <RQButton
            type="primary"
            onClick={() => {
              setShowSuccess(true);
              setOpenModal(true);
              trackTeamPlanBannerClicked("get_subscription", "banner");
              sendRequestEmail();
            }}
          >
            Get a team subscription
          </RQButton>
        </Space>
        {orgBannerConfig?.isDismissable === false ? null : (
          <div className="close-button-container">
            <RQButton
              iconOnly
              className="close-btn"
              onClick={handleCloseBannerClick}
              icon={
                <svg width="11.67" height="11.67" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#ffffff"
                    d="M1.08736 1.08492C1.31516 0.857111 1.68451 0.857111 1.91232 1.08492L4.99984 4.17244L8.08736 1.08492C8.31517 0.857111 8.68451 0.857111 8.91232 1.08492C9.14012 1.31272 9.14012 1.68207 8.91232 1.90988L5.8248 4.9974L8.91232 8.08492C9.14012 8.31272 9.14012 8.68207 8.91232 8.90988C8.68451 9.13768 8.31517 9.13768 8.08736 8.90988L4.99984 5.82235L1.91232 8.90988C1.68451 9.13768 1.31516 9.13768 1.08736 8.90988C0.859552 8.68207 0.859552 8.31272 1.08736 8.08492L4.17488 4.9974L1.08736 1.90988C0.859552 1.68207 0.859552 1.31272 1.08736 1.08492Z"
                  />
                </svg>
              }
            />
          </div>
        )}
      </span>
      <UsersModal
        users={userDetails}
        isModalOpen={openModal}
        onCancel={() => setOpenModal(false)}
        sendRequestEmail={sendRequestEmail}
        showSuccess={showSuccess}
      />
    </>
  );
};
