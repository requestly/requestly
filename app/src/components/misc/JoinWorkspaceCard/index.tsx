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
import {
  trackWorkspaceOrganizationCardCancelled,
  trackWorkspaceOrganizationCardClicked,
  trackWorkspaceOrganizationCardViewed,
} from "modules/analytics/events/common/teams";
import { trackWorkspaceJoiningModalOpened } from "modules/analytics/events/features/teams";
import "./index.css";

const MIN_MEMBERS_IN_WORKSPACE = 3;

export const JoinWorkspaceCard = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0], [
    user?.details?.profile?.email,
  ]);
  const [teamInvites, setTeamInvites] = useState([]);
  const [organizationMembers, setOrganizationMembers] = useState(null);
  const [hasActiveWorkspace, setHasActiveWorkspace] = useState(false);
  const [hasEmailInvite, setHasEmailInvite] = useState(false);

  const cardCTA = useMemo(
    () => (hasEmailInvite ? "Show invites" : hasActiveWorkspace ? "Join your teammates" : "Start collaborating"),
    [hasEmailInvite, hasActiveWorkspace]
  );

  const handleNudgeCTAClick = () => {
    if (hasActiveWorkspace || hasEmailInvite) {
      trackWorkspaceOrganizationCardClicked("join_teammates");
      trackWorkspaceJoiningModalOpened(teamInvites.length, "join_workspace_card");
      dispatch(
        actions.toggleActiveModal({
          modalName: "joinWorkspaceModal",
          newValue: true,
          newProps: {
            callback: () => dispatch(actions.updateJoinWorkspaceCardVisible(false)),
          },
        })
      );
    } else {
      trackWorkspaceOrganizationCardClicked("create_team");
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: {
            callback: () => {
              dispatch(actions.updateJoinWorkspaceCardVisible(false));
            },
            source: "join_workspace_card",
          },
        })
      );
    }
  };

  useEffect(() => {
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      if (result && isCompanyEmail(user?.details?.profile?.email)) {
        getOrganizationUsers({
          domain: getDomainFromEmail(user?.details?.profile?.email),
          size: MIN_MEMBERS_IN_WORKSPACE,
        }).then((res) => {
          setOrganizationMembers(res.data);
        });
      }
    });
  }, [getOrganizationUsers, user?.details?.profile?.email, user?.details?.profile?.uid]);

  useEffect(() => {
    if (organizationMembers && organizationMembers.total >= MIN_MEMBERS_IN_WORKSPACE) {
      getPendingInvites({ email: true, domain: true })
        .then((res: any) => {
          if (res?.pendingInvites) {
            setTeamInvites(res.pendingInvites);
            setHasEmailInvite(res.pendingInvites.some((invite: Invite) => !invite.domains?.length));
            const hasActiveMembers = res.pendingInvites.some(
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

  useEffect(() => {
    if (organizationMembers?.total >= MIN_MEMBERS_IN_WORKSPACE && user.loggedIn) {
      trackWorkspaceOrganizationCardViewed(getDomainFromEmail(user?.details?.profile?.email), cardCTA);
    }
  }, [cardCTA, organizationMembers?.total, user.loggedIn, user?.details?.profile?.email]);

  return (
    <>
      {organizationMembers && organizationMembers.total >= MIN_MEMBERS_IN_WORKSPACE && user.loggedIn ? (
        <div className="workspace-card-container">
          <Row justify="end">
            <RQButton
              type="default"
              className="nudge-close-icon"
              iconOnly
              icon={<CloseOutlined />}
              onClick={() => {
                dispatch(actions.updateJoinWorkspaceCardVisible(false));
                trackWorkspaceOrganizationCardCancelled(getDomainFromEmail(user?.details?.profile?.email), cardCTA);
              }}
            />
          </Row>
          {!hasEmailInvite && (
            <div className="workspace-card-avatar-row-container">
              <Avatar.Group maxCount={MIN_MEMBERS_IN_WORKSPACE}>
                {organizationMembers.users.map((member: User) => (
                  <Avatar
                    src={member.photoURL.length ? member.photoURL : "https://www.gravatar.com/avatar/000?d=mp&f=y"}
                    alt="organization member"
                  />
                ))}
              </Avatar.Group>
              {organizationMembers.total > MIN_MEMBERS_IN_WORKSPACE ? (
                <div className="other-users-avatar">+{organizationMembers.total - MIN_MEMBERS_IN_WORKSPACE}</div>
              ) : null}
            </div>
          )}

          {hasEmailInvite && (
            <Typography.Text className="display-block workspace-card-text">
              You have pending workspace invites.
            </Typography.Text>
          )}

          {!hasEmailInvite && hasActiveWorkspace ? (
            <Typography.Text className="display-block workspace-card-text">
              {organizationMembers.total} users from{" "}
              <span className="text-white text-bold">{capitalize(userEmailDomain)} </span>
              are using Requestly and collaborating on a team workspace.
            </Typography.Text>
          ) : (
            <Typography.Text className="display-block workspace-card-text">
              {organizationMembers.total} users from{" "}
              <span className="text-white text-bold">{capitalize(userEmailDomain)}</span> are using Requestly.
            </Typography.Text>
          )}

          <RQButton type="primary" className="mt-8 text-bold" onClick={handleNudgeCTAClick}>
            {cardCTA}
          </RQButton>
        </div>
      ) : null}
    </>
  );
};
