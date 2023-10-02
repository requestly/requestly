import React, { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getGroupwiseRulesToPopulate, getUserAuthDetails } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { Avatar, Row, Divider } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { RQButton } from "lib/design-system/components";
import { WorkspaceShareMenu } from "./WorkspaceShareMenu";
import puzzleImg from "assets/images/illustrations/puzzle.svg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { isVerifiedBusinessDomainUser } from "utils/Misc";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { duplicateRulesToTargetWorkspace } from "../actions";
import { trackAddTeamMemberSuccess, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { WorkspaceSharingTypes, PostShareViewData } from "../types";
import { Team, TeamRole } from "types";
import "./index.scss";
import { trackSharingModalRulesDuplicated } from "modules/analytics/events/misc/sharing";

interface Props {
  selectedRules: string[];
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
}

export const ShareFromPrivate: React.FC<Props> = ({ selectedRules, setPostShareViewData }) => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const groupwiseRules = useSelector(getGroupwiseRulesToPopulate);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
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
      createTeam({
        teamName: isBusinessUser ? getDomainFromEmail(user?.details?.profile?.email) : "My Team",
      }).then((res: any) => {
        const teamId = res.data.teamId;
        const teamData = res.data;
        trackNewTeamCreateSuccess(teamId, teamData.name, "sharing_modal");

        createTeamInvites({
          teamId,
          emails: memberEmails,
          role: TeamRole.write,
        }).then((res: any) => {
          setIsLoading(false);
          if (res?.data?.success) trackAddTeamMemberSuccess(teamId, memberEmails, TeamRole.write, "sharing_modal");
        });

        duplicateRulesToTargetWorkspace(appMode, teamId, selectedRules, groupwiseRules).then(() => {
          setIsLoading(false);
          trackSharingModalRulesDuplicated("personal", selectedRules.length);
          setPostShareViewData({
            type: WorkspaceSharingTypes.NEW_WORKSPACE_CREATED,
            targetTeamData: { teamId, teamName: teamData.name, accessCount: teamData.accessCount },
          });
        });
      });
    } catch (e) {
      setIsLoading(false);
    }
  }, [
    appMode,
    groupwiseRules,
    memberEmails,
    selectedRules,
    setPostShareViewData,
    user?.details?.profile?.email,
    user?.details?.profile?.uid,
  ]);

  const handleRulesTransfer = useCallback(
    (teamData: Team) => {
      setIsLoading(true);
      duplicateRulesToTargetWorkspace(appMode, teamData.id, selectedRules, groupwiseRules).then(() => {
        setIsLoading(false);
        trackSharingModalRulesDuplicated("personal", selectedRules.length);
        setPostShareViewData({
          type: WorkspaceSharingTypes.EXISTING_WORKSPACE,
          targetTeamData: { teamId: teamData.id, teamName: teamData.name, accessCount: teamData.accessCount },
          sourceTeamData: currentlyActiveWorkspace,
        });
      });
    },
    [appMode, groupwiseRules, selectedRules, currentlyActiveWorkspace, setPostShareViewData]
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
        <ReactMultiEmail
          className="sharing-modal-email-input"
          emails={memberEmails}
          onChange={setMemberEmails}
          validateEmail={validateEmail}
          getLabel={(email, index, removeEmail) => (
            <div data-tag key={index} className="multi-email-tag">
              {email}
              <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
                <img alt="remove" src="/assets/img/workspaces/cross.svg" />
              </span>
            </div>
          )}
        />
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
