import React, { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { Avatar, Row, Divider } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { WorkspaceShareMenu } from "./WorkspaceShareMenu";
import puzzleImg from "assets/images/illustrations/puzzle.svg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { isVerifiedBusinessDomainUser } from "utils/Misc";
import { duplicateRulesToTargetWorkspace } from "../actions";
import { trackAddTeamMemberSuccess, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { WorkspaceSharingTypes, PostShareViewData } from "../types";
import { Team, TeamRole } from "types";
import { trackSharingModalRulesDuplicated } from "modules/analytics/events/misc/sharing";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { generateDefaultTeamName } from "utils/teams";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import "./index.scss";

interface Props {
  selectedRules: string[];
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
  onRulesShared?: () => void;
}

export const ShareFromPrivate: React.FC<Props> = ({
  selectedRules,
  setPostShareViewData,
  onRulesShared = () => {},
}) => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const _availableTeams = useRef(availableTeams);

  const [memberEmails, setMemberEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSharingInNewWorkspace = useCallback(async () => {
    setIsLoading(true);
    const functions = getFunctions();
    const createTeam = httpsCallable(functions, "teams-createTeam");
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");

    const isBusinessUser = await isVerifiedBusinessDomainUser(
      user?.details?.profile?.email,
      user?.details?.profile?.uid
    );
    try {
      const teamName = isBusinessUser
        ? generateDefaultTeamName(user.details?.profile?.displayName, user?.details?.profile?.email)
        : "My Team";
      createTeam({
        teamName: teamName,
      }).then((res: any) => {
        const teamId = res.data.teamId;
        const teamData = res.data;
        trackNewTeamCreateSuccess(teamId, teamData.name, "sharing_modal");

        createTeamInvites({
          teamId,
          emails: memberEmails,
          role: TeamRole.write,
          teamName,
          source: "sharing_modal_new_team",
          numberOfMembers: 1,
        }).then((res: any) => {
          setIsLoading(false);
          if (res?.data?.success)
            trackAddTeamMemberSuccess({
              team_id: teamId,
              email: memberEmails,
              is_admin: false,
              source: "sharing_modal",
              num_users_added: memberEmails.length,
              workspace_type: isWorkspaceMappedToBillingTeam(teamId, billingTeams)
                ? TEAM_WORKSPACES.WORKSPACE_TYPE.MAPPED_TO_BILLING_TEAM
                : TEAM_WORKSPACES.WORKSPACE_TYPE.NOT_MAPPED_TO_BILLING_TEAM,
            });
        });

        duplicateRulesToTargetWorkspace(appMode, teamId, selectedRules).then(() => {
          setIsLoading(false);
          trackSharingModalRulesDuplicated("personal", selectedRules.length);
          setPostShareViewData({
            type: WorkspaceSharingTypes.NEW_WORKSPACE_CREATED,
            targetTeamData: { teamId, teamName: teamData.name, accessCount: teamData.accessCount },
          });

          onRulesShared();
        });
      });
    } catch (e) {
      setIsLoading(false);
    }
  }, [
    appMode,
    onRulesShared,
    memberEmails,
    selectedRules,
    setPostShareViewData,
    user.details?.profile?.displayName,
    user?.details?.profile?.email,
    user?.details?.profile?.uid,
    billingTeams,
  ]);

  const handleRulesTransfer = useCallback(
    (teamData: Team) => {
      setIsLoading(true);
      duplicateRulesToTargetWorkspace(appMode, teamData.id, selectedRules).then(() => {
        setIsLoading(false);
        trackSharingModalRulesDuplicated("personal", selectedRules.length);
        setPostShareViewData({
          type: WorkspaceSharingTypes.EXISTING_WORKSPACE,
          targetTeamData: { teamId: teamData.id, teamName: teamData.name, accessCount: teamData.accessCount },
          sourceTeamData: currentlyActiveWorkspace,
        });

        onRulesShared();
      });
    },
    [appMode, onRulesShared, selectedRules, currentlyActiveWorkspace, setPostShareViewData]
  );

  return (
    <>
      <Row align="middle">
        <Avatar
          size={35}
          shape="square"
          icon={<LockOutlined />}
          className="workspace-avatar"
          style={{ backgroundColor: "#1E69FF" }}
        />
        <span className="workspace-card-description">
          <div className="text-white">Private workspace</div>
          <div className="text-gray">Not shared with anyone</div>
        </span>
      </Row>
      {_availableTeams.current.length ? (
        <>
          <div className="mt-1">Transfer rules into a workspace to start collaborating</div>
          <WorkspaceShareMenu isLoading={isLoading} defaultActiveWorkspaces={2} onTransferClick={handleRulesTransfer} />
          <Divider />
        </>
      ) : (
        <>{bannerToUseWorkspace}</>
      )}
      <div className="sharing-modal-email-input-wrapper">
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <EmailInputWithDomainBasedSuggestions onChange={setMemberEmails} />
      </div>
      <RQButton
        className="mt-1 text-bold sharing-primary-btn"
        type="primary"
        onClick={handleSharingInNewWorkspace}
        loading={isLoading}
        disabled={!memberEmails.length}
      >
        Create workspace & share
      </RQButton>
    </>
  );
};

const bannerToUseWorkspace = (
  <div className="no-available-team-hero-section">
    <img src={puzzleImg} alt="puzzle" width={48} />
    <div className="subheader mt-8">Don't just share, collaborate!</div>
    <div className="text-center text-gray" style={{ maxWidth: "340px" }}>
      Invite your friends & work together as a team share rules, recordings and more, collaborate in realtime.
    </div>
  </div>
);
