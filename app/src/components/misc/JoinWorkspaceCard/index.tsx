import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Row, Avatar, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { CloseOutlined } from "@ant-design/icons";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getPendingInvites } from "backend/workspace";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { isEmailVerified } from "utils/AuthUtils";
import { actions } from "store";
import { capitalize } from "lodash";
import { Invite, User } from "types";
import "./index.css";

export const JoinWorkspaceCard = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0], [
    user?.details?.profile?.email,
  ]);

  const [isBusinessDomainUser, setIsBusinessDomainUser] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState(null);
  const [hasActiveWorkspace, setHasActiveWorkspace] = useState(false);

  const handleNudgeCTAClick = () => {
    if (hasActiveWorkspace) {
      dispatch(actions.toggleActiveModal({ modalName: "joinWorkspaceModal", newValue: true }));
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: {
            callback: () => {},
          },
        })
      );
    }
  };

  useEffect(() => {
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      if (result && isCompanyEmail(user?.details?.profile?.email)) {
        setIsBusinessDomainUser(true);
        getOrganizationUsers({ domain: getDomainFromEmail(user?.details?.profile?.email), size: 3 }).then((res) => {
          setOrganizationMembers(res.data);
        });
      }
    });
  }, [getOrganizationUsers, user?.details?.profile?.email, user?.details?.profile?.uid]);

  useEffect(() => {
    if (organizationMembers && organizationMembers.total >= 3) {
      getPendingInvites({ email: true, domain: true })
        .then((res: any) => {
          if (res?.pendingInvites) {
            const hasActiveMembers = res?.pendingInvites?.some(
              (invite: Invite) => (invite.metadata.teamAccessCount as number) > 1
            );
            if (hasActiveMembers) {
              setHasActiveWorkspace(true);
            }
          }
        })
        .catch((e) => {
          setHasActiveWorkspace(false);
        });
    }
  }, [organizationMembers]);

  console.log({ isBusinessDomainUser, organizationMembers, hasActiveWorkspace });
  return (
    <>
      {organizationMembers && organizationMembers.total >= 3 ? (
        <div className="workspace-card-container">
          <Row justify="end">
            <RQButton
              type="default"
              className="nudge-close-icon"
              iconOnly
              icon={<CloseOutlined />}
              //   onClick={() => {
              //     dispatch(actions.updateJoinWorkspacePromptVisible(false));
              //     trackWorkspaceOrganizationCardCancelled(
              //       userEmailDomain,
              //       hasActiveWorkspace ? "join_teammates" : "create_team"
              //     );
              //   }}
            />
          </Row>
          <div className="workspace-card-avatar-row-container">
            <Avatar.Group maxCount={3}>
              {organizationMembers.users.map((member: User) => (
                <Avatar
                  src={member.photoURL.length ? member.photoURL : "https://www.gravatar.com/avatar/000?d=mp&f=y"}
                  alt="organization member"
                />
              ))}
            </Avatar.Group>
            <div className="other-users-avatar">+{organizationMembers.total - 3}</div>
          </div>
          <Typography.Text className="display-block workspace-card-text">
            {hasActiveWorkspace ? (
              <>
                {organizationMembers.total} users from{" "}
                <span className="text-white text-bold">{capitalize(userEmailDomain)} </span>
                are collaborating on a team workspace
              </>
            ) : (
              <>
                {organizationMembers.total} users from{" "}
                <span className="text-white text-bold">{capitalize(userEmailDomain)}</span> are using Requestly.
              </>
            )}
          </Typography.Text>
          <RQButton type="primary" className="mt-8 text-bold" onClick={handleNudgeCTAClick}>
            {hasActiveWorkspace ? "Join your teammates" : "Start collaborating"}
          </RQButton>
        </div>
      ) : null}
    </>
  );
};
