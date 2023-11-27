import React from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import "./appNotificationBanner.scss";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { Avatar, Divider, Row, Typography } from "antd";
import { parseGravatarImage } from "utils/Misc";
import { toast } from "utils/Toast";

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
              Thank you for showing interest in the Requestly team plan. We will reach out to you shortly via email.
            </div>
          </div>
        ) : (
          <>
            <Row justify={"space-between"}>
              <Typography.Title level={4}> {`${users.length} ${users?.[0]?.domain}  users`}</Typography.Title>
              <RQButton type="primary" onClick={sendRequestEmail}>
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
    if (!isCompanyEmail(userEmail)) return;
    getOrganizationUsers({ domain: getDomainFromEmail(userEmail) }).then((result: any) => {
      setUserDetails(result.data.users);
    });
  }, [getOrganizationUsers, userEmail]);

  if (userDetails.length === 0) return null;

  return (
    <>
      <span className="app-banner" style={{ backgroundColor: "#621F56" }}>
        <div className="app-banner-text">
          {`${userDetails.length} users from ${userDetails[0]?.domain} are using Requestly and are facing limits. You won't be able to use the premium features for
          free from 30th November.`}
        </div>
        <RQButton onClick={() => setOpenModal(true)} className="view-users-button">
          View Users
        </RQButton>
        <RQButton
          type="primary"
          onClick={() => {
            setOpenModal(true);
            sendRequestEmail();
          }}
        >
          Get a team subscription
        </RQButton>
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
