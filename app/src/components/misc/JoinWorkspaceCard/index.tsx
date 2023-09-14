import { useState, useMemo, useEffect, useCallback } from "react";
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
import PATHS from "config/constants/sub/paths";
import "./index.css";
import { getUniqueColorForWorkspace, getUniqueTeamsFromInvites } from "utils/teams";

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

  const hideCard = useMemo(
    () =>
      window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE) || window.location.href.includes("/invite"),
    []
  );

  const handleNudgeCTAClick = useCallback(() => {
    if (hasEmailInvite) {
      trackWorkspaceOrganizationCardClicked("Show invites");
    } else if (hasActiveWorkspace) {
      trackWorkspaceOrganizationCardClicked("Join your teammates");
    }

    if (hasActiveWorkspace || hasEmailInvite) {
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
      trackWorkspaceOrganizationCardClicked("Start collaborating");
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
  }, [hasEmailInvite, hasActiveWorkspace, dispatch, teamInvites.length]);

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
    if (!organizationMembers || organizationMembers.total < MIN_MEMBERS_IN_WORKSPACE) {
      return;
    }

    getPendingInvites({ email: true, domain: true })
      .then((res: any) => {
        const domain = getDomainFromEmail(user?.details?.profile?.email);
        if (res?.pendingInvites && res.pendingInvites.length > 0) {
          const hasEmailInvites = res.pendingInvites.some((invite: Invite) => !invite.domains?.length);
          const hasActiveMembers = res.pendingInvites.some(
            (invite: Invite) => (invite.metadata.teamAccessCount as number) > 1
          );

          setTeamInvites(res.pendingInvites);
          setHasEmailInvite(hasEmailInvites);
          setHasActiveWorkspace(hasActiveMembers);

          const actionType = hasEmailInvites
            ? "Show invites"
            : hasActiveMembers
            ? "Join your teammates"
            : "Start collaborating";

          trackWorkspaceOrganizationCardViewed(domain, actionType);
        } else {
          trackWorkspaceOrganizationCardViewed(domain, "Start collaborating");
        }
      })
      .catch((error) => {
        setHasActiveWorkspace(false);
      });
  }, [organizationMembers, user]);

  return (
    <>
      {!hideCard && organizationMembers && organizationMembers?.total >= MIN_MEMBERS_IN_WORKSPACE ? (
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
          {hasEmailInvite ? (
            <div className="workspace-card-avatar-row-container">
              <Avatar.Group maxCount={3}>
                {getUniqueTeamsFromInvites(teamInvites).map((team, index) => (
                  <Avatar
                    key={index}
                    icon={<>{team?.teamName?.charAt(0)?.toUpperCase()}</>}
                    style={{
                      backgroundColor: `${getUniqueColorForWorkspace(team.teamId, team.teamName)}`,
                    }}
                  />
                ))}
              </Avatar.Group>
            </div>
          ) : (
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
              Your teammates have invited you to join team workspace.
            </Typography.Text>
          )}

          {!hasEmailInvite ? (
            hasActiveWorkspace ? (
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
            )
          ) : null}

          <RQButton
            type="primary"
            className="mt-8 text-bold"
            style={{ display: "block" }}
            onClick={handleNudgeCTAClick}
          >
            {cardCTA}
          </RQButton>
        </div>
      ) : null}
    </>
  );
};
