import React from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import "./appNotificationBanner.scss";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { Avatar, Divider, Row, Space, Typography } from "antd";
import { parseGravatarImage } from "utils/Misc";
import { toast } from "utils/Toast";
import { trackTeamPlanBannerClicked, trackTeamPlanBannerViewed } from "modules/analytics/events/common/teams";

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
  const user = useSelector(getUserAuthDetails);
  const userEmail = user?.details?.profile?.email;

  const [userDetails, setUserDetails] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const showOrgNotificationBanner = true;

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);
  const sendTeamSubscriptionRequestEmail = useMemo(
    () => httpsCallable(getFunctions(), "internalNotifications-sendTeamSubscriptionRequestEmail"),
    []
  );

  const sendRequestEmail = useCallback(() => {
    sendTeamSubscriptionRequestEmail({ userCount: userDetails.length })
      .then(() => {
        setShowSuccess(true);
      })
      .catch(() => toast.error("Error while sending email. Please try again later."));
  }, [sendTeamSubscriptionRequestEmail, userDetails.length]);

  useEffect(() => {
    if (isCompanyEmail(userEmail)) {
      getOrganizationUsers({ domain: getDomainFromEmail(userEmail) }).then((result: any) => {
        setUserDetails(result.data.users);
        if (result.data.users.length > 0) {
          trackTeamPlanBannerViewed();
        }
      });
    }
  }, [getOrganizationUsers, userEmail]);

  if (!showOrgNotificationBanner || userDetails.length === 0) return null;

  return (
    <>
      <span className="app-banner" style={{ backgroundColor: "#621F56" }}>
        <Space size="middle">
          <div className="app-banner-text">
            <span className="text-bold">{`${userDetails.length} users `}</span>from
            <span className="text-bold text-capitalize">{` ${userDetails[0]?.domain?.split(".")[0]}`}</span>
            {` are using Requestly and are facing limits. You won't be able to use the premium features for
          free from `}
            <span className="text-bold">30th November</span>
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
