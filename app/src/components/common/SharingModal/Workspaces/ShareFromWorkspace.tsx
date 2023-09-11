import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { WorkspaceShareMenu } from "./WorkspaceShareMenu";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { RQButton } from "lib/design-system/components";
import CopyButton from "components/misc/CopyButton";
import { httpsCallable, getFunctions } from "firebase/functions";
import { trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import { PostShareViewData, WorkspaceSharingTypes } from "../types";
import { Team, TeamRole } from "types";
import { duplicateRulesToTargetWorkspace } from "../actions";
import {
  trackSharingModalRulesDuplicated,
  trackSharingUrlInWorkspaceCopied,
} from "modules/analytics/events/misc/sharing";
import PATHS from "config/constants/sub/paths";

interface Props {
  selectedRules: string[];
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
}

export const ShareFromWorkspace: React.FC<Props> = ({ selectedRules, setPostShareViewData }) => {
  const appMode = useSelector(getAppMode);
  const groupwiseRules = useSelector(getGroupwiseRulesToPopulate);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const [memberEmails, setMemberEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteMembers = useCallback(() => {
    setIsLoading(true);
    const createTeamInvites = httpsCallable(getFunctions(), "invites-createTeamInvites");
    createTeamInvites({
      teamId: currentlyActiveWorkspace.id,
      emails: memberEmails,
      role: TeamRole.write,
      allowMembersToInvite: true,
    }).then((res: any) => {
      setIsLoading(false);
      if (res?.data?.success)
        trackAddTeamMemberSuccess(currentlyActiveWorkspace.id, memberEmails, TeamRole.write, "sharing_modal");
      setPostShareViewData({
        type: WorkspaceSharingTypes.USERS_INVITED,
      });
    });
  }, [memberEmails, currentlyActiveWorkspace.id, setPostShareViewData]);

  const handleTransferToOtherWorkspace = useCallback(
    (teamData: Team) => {
      setIsLoading(true);
      duplicateRulesToTargetWorkspace(appMode, teamData.id, selectedRules, groupwiseRules).then(() => {
        setIsLoading(false);
        trackSharingModalRulesDuplicated("team", selectedRules.length);
        setPostShareViewData({
          type: WorkspaceSharingTypes.EXISTING_WORKSPACE,
          targetTeamData: { teamId: teamData.id, teamName: teamData.name, accessCount: teamData.accessCount },
          sourceTeamData: currentlyActiveWorkspace,
        });
      });
    },
    [appMode, selectedRules, groupwiseRules, currentlyActiveWorkspace, setPostShareViewData]
  );

  return (
    <>
      <WorkspaceShareMenu onTransferClick={handleTransferToOtherWorkspace} isLoading={isLoading} />
      <div className="subheader mt-1">Share with Teammates</div>
      <div className="mt-8 text-gray">Collaborate in real-time with your teammates within a shared workspace.</div>
      <div className="mt-1">
        <label className="caption text-gray">Email addresses</label>
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
            <CopyButton
              title="Copy link"
              type="default"
              copyText={`${window.location.origin}${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${selectedRules[0]}?workspaceId=${currentlyActiveWorkspace.id}`}
              showIcon={false}
              disableTooltip
              trackCopiedEvent={() => trackSharingUrlInWorkspaceCopied("rule")}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};
