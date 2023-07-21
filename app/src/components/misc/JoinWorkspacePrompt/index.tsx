import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Typography, Row, Avatar } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { actions } from "store";
import { Invite, TeamInvite, TeamInviteMetadata } from "types";
import JoinWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/JoinWorkspaceModal";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getUniqueTeamsFromInvites } from "utils/teams";
import { isEmailVerified } from "utils/AuthUtils";
import {
  trackWorkspaceOrganizationCardViewed,
  trackWorkspaceOrganizationCardCancelled,
  trackWorkspaceOrganizationCardClicked,
  trackWorkspaceJoiningModalOpened,
} from "modules/analytics/events/features/teams";
import "./index.css";

export const JoinWorkspacePrompt: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [hasActiveWorkspace, setHasActiveWorkspace] = useState<boolean>(false);
  const [teamInvites, setTeamInvites] = useState<TeamInviteMetadata[]>(null);
  const [isJoinWorkspaceModalVisible, setIsJoinWorkspaceModalVisible] = useState<boolean>(false);
  const [organizationMembers, setOrganizationMembers] = useState(null);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [isBusinessDomainUser, setIsBusinessDomainUser] = useState<boolean>(false);

  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0], [
    user?.details?.profile?.email,
  ]);

  const getPendingInvites = useMemo(
    () =>
      httpsCallable<{ email: boolean; domain: boolean }, { pendingInvites: TeamInvite[]; success: boolean }>(
        getFunctions(),
        "teams-getPendingTeamInvites"
      ),
    []
  );

  const getOrganizationMembers = useMemo(() => httpsCallable(getFunctions(), "getOrganizationMembers"), []);

  const createOrganizationMap = useMemo(() => httpsCallable(getFunctions(), "generateOrganizationMap"), []);

  const handleNudgeCTAClick = () => {
    if (hasActiveWorkspace) {
      setIsJoinWorkspaceModalVisible(true);
      trackWorkspaceJoiningModalOpened(teamInvites, "workspace_organization_card");
      trackWorkspaceOrganizationCardClicked("join_teammates");
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: {
            defaultWorkspaceName: `${userEmailDomain} <team name>`,
            callback: () => dispatch(actions.updateJoinWorkspacePromptClosed()),
            source: "workspace_organization_card",
          },
        })
      );
      trackWorkspaceOrganizationCardClicked("create_team");
    }
  };

  useEffect(() => {
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      if (result && isCompanyEmail(user?.details?.profile?.email)) setIsBusinessDomainUser(true);
      else {
        setIsBusinessDomainUser(false);
        dispatch(actions.updateJoinWorkspacePromptClosed());
      }
    });
  }, [user?.details?.profile?.uid, user?.details?.profile?.email, dispatch]);

  useEffect(() => {
    if (isBusinessDomainUser) {
      getOrganizationMembers({ domain: getDomainFromEmail(user?.details?.profile?.email) })
        .then((result) => {
          if (result.data) {
            setOrganizationMembers(result.data);
            setMembersCount(Object.keys(result.data).length);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [userEmailDomain, user?.details?.profile?.email, isBusinessDomainUser, getOrganizationMembers]);

  useEffect(() => {
    if (user?.loggedIn && isBusinessDomainUser) {
      getPendingInvites({ email: true, domain: true })
        .then((res) => {
          if (res?.data?.pendingInvites) {
            const hasActive = res.data.pendingInvites.some(
              (invite: Invite) => (invite.metadata.teamAccessCount as number) > 1
            );
            if (hasActive) {
              setHasActiveWorkspace(true);
              const uniqueInvites = getUniqueTeamsFromInvites(res.data.pendingInvites);
              setTeamInvites(uniqueInvites);
              trackWorkspaceOrganizationCardViewed(userEmailDomain, "join_teammates");
            } else trackWorkspaceOrganizationCardViewed(userEmailDomain, "create_team");
          }
        })
        .catch((e) => {
          setHasActiveWorkspace(false);
        });
    }
  }, [dispatch, getPendingInvites, user?.loggedIn, isBusinessDomainUser, userEmailDomain]);

  return (
    <>
      {membersCount >= 3 && isBusinessDomainUser ? (
        <>
          <div className="nudge-container">
            <Row justify="end">
              <RQButton
                type="default"
                className="nudge-close-icon"
                iconOnly
                icon={<CloseOutlined />}
                onClick={() => {
                  dispatch(actions.updateJoinWorkspacePromptClosed());
                  trackWorkspaceOrganizationCardCancelled(
                    userEmailDomain,
                    hasActiveWorkspace ? "join_teammates" : "create_team"
                  );
                }}
              />
            </Row>
            <div className="avatar-row-container">
              <Avatar.Group maxCount={3}>
                {Object.keys(organizationMembers).map((memberId) => (
                  <Avatar
                    src={
                      organizationMembers[memberId].photoURL.length
                        ? organizationMembers[memberId].photoURL
                        : "https://www.gravatar.com/avatar/000?d=mp&f=y"
                    }
                    alt="organization member"
                  />
                ))}
              </Avatar.Group>
            </div>
            <Typography.Text className="display-block nudge-text">
              {hasActiveWorkspace
                ? `${membersCount} users from ${userEmailDomain} are collaborating on a team workspace`
                : `${membersCount} users from ${userEmailDomain} are using Requestly.`}
            </Typography.Text>
            <RQButton type="primary" className="mt-8 text-bold" onClick={handleNudgeCTAClick}>
              {hasActiveWorkspace ? "Join your teammates" : "Start collaborating"}
            </RQButton>
            {/* This Button triggers a function to create an organization node in firestore to maintain all business domain users accorrding to their email domain
              This is a one time invokation function
            */}
            <RQButton onClick={() => createOrganizationMap()}>Create Org node(TEST)</RQButton>
          </div>
          {isJoinWorkspaceModalVisible && (
            <JoinWorkspaceModal
              isOpen={isJoinWorkspaceModalVisible}
              teamInvites={teamInvites}
              handleModalClose={() => setIsJoinWorkspaceModalVisible(false)}
              allowCreateNewWorkspace={false}
              callback={() => dispatch(actions.updateJoinWorkspacePromptClosed())}
            />
          )}
        </>
      ) : null}
    </>
  );
};
