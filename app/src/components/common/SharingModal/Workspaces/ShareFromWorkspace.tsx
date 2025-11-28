import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { WorkspaceShareMenu } from "./WorkspaceShareMenu";
import { Tooltip } from "antd";
import { RQButton } from "lib/design-system/components";
import CopyButton from "components/misc/CopyButton";
import { httpsCallable, getFunctions } from "firebase/functions";
import { trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import { PostShareViewData, WorkspaceSharingTypes } from "../types";
import { TeamRole } from "types";
import { duplicateRulesToTargetWorkspace } from "../actions";
import {
  trackSharingModalRulesDuplicated,
  trackSharingModalToastViewed,
  trackSharingUrlInWorkspaceCopied,
} from "modules/analytics/events/misc/sharing";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { Workspace } from "features/workspaces/types";

interface Props {
  selectedRules: string[];
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
  onRulesShared?: () => void;
}

export const ShareFromWorkspace: React.FC<Props> = ({
  selectedRules,
  setPostShareViewData,
  onRulesShared = () => {},
}) => {
  const appMode = useSelector(getAppMode);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteMembers = useCallback(() => {
    setIsLoading(true);
    const createTeamInvites = httpsCallable(getFunctions(), "invites-createTeamInvites");
    createTeamInvites({
      teamId: activeWorkspace.id,
      emails: memberEmails,
      role: TeamRole.write,
      teamName: activeWorkspace.name,
      numberOfMembers: activeWorkspace.accessCount,
      source: "sharing_modal_from_workspace",
    }).then((res: any) => {
      const hasSuccessfulInvite = res?.data.results.some((result: any) => result.success);

      if (hasSuccessfulInvite) {
        trackAddTeamMemberSuccess({
          team_id: activeWorkspace.id,
          email: memberEmails,
          is_admin: false,
          source: "sharing_modal",
          num_users_added: memberEmails.length,
          workspace_type: isWorkspaceMappedToBillingTeam(activeWorkspace.id, billingTeams)
            ? TEAM_WORKSPACES.WORKSPACE_TYPE.MAPPED_TO_BILLING_TEAM
            : TEAM_WORKSPACES.WORKSPACE_TYPE.NOT_MAPPED_TO_BILLING_TEAM,
        });
        setPostShareViewData({
          type: WorkspaceSharingTypes.USERS_INVITED,
        });

        onRulesShared();
      } else {
        const errorMessage = "The user is either in the workspace or has a pending invite.";
        toast.error(errorMessage);
        trackSharingModalToastViewed(errorMessage);
      }
      setIsLoading(false);
    });
  }, [memberEmails, onRulesShared, activeWorkspace, setPostShareViewData, billingTeams]);

  const handleTransferToOtherWorkspace = useCallback(
    (teamData: Workspace) => {
      setIsLoading(true);
      duplicateRulesToTargetWorkspace(appMode, teamData.id, selectedRules).then(() => {
        setIsLoading(false);
        trackSharingModalRulesDuplicated("team", selectedRules.length);
        setPostShareViewData({
          type: WorkspaceSharingTypes.EXISTING_WORKSPACE,
          targetTeamData: teamData,
          sourceTeamData: activeWorkspace,
        });

        onRulesShared();
      });
    },
    [appMode, onRulesShared, selectedRules, activeWorkspace, setPostShareViewData]
  );

  return (
    <>
      <WorkspaceShareMenu onTransferClick={handleTransferToOtherWorkspace} isLoading={isLoading} />
      <div className="subheader mt-1">Share with Teammates</div>
      <div className="mt-8 text-gray">Collaborate in real-time with your teammates within a shared workspace.</div>
      <div className="mt-1">
        <label className="caption text-gray">Email addresses</label>
        <EmailInputWithDomainBasedSuggestions onChange={setMemberEmails} />
        <div className="items-center space-between w-full mt-1">
          <RQButton
            type="primary"
            className="sharing-primary-btn"
            loading={isLoading}
            disabled={!memberEmails.length}
            onClick={handleInviteMembers}
          >
            Share
          </RQButton>
          {selectedRules.length === 1 ? (
            <Tooltip
              title="Anyone in the workspace will be able to view the rule."
              placement="bottom"
              color="var(--border-dark)"
              overlayInnerStyle={{
                color: "var(--text-gray)",
                fontSize: "13px",
                width: "max-content",
              }}
            >
              <>
                <CopyButton
                  title="Copy link"
                  type="secondary"
                  copyText={`${window.location.origin}${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${selectedRules[0]}?wId=${activeWorkspace.id}`}
                  showIcon={false}
                  disableTooltip
                  trackCopiedEvent={() => trackSharingUrlInWorkspaceCopied("rule")}
                />
              </>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </>
  );
};
