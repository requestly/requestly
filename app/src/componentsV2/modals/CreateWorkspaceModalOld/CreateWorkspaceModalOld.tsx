import React, { useCallback, useState } from "react";
import { Checkbox, Input, Modal, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import * as Sentry from "@sentry/react";

import { getAppMode } from "store/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { CreateTeamParams, SharedOrPrivateWorkspaceConfig } from "types";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  trackAddTeamMemberSuccess,
  trackNewTeamCreateFailure,
  trackNewTeamCreateSuccess,
} from "modules/analytics/events/features/teams";
import { toast } from "utils/Toast";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import "./createOldWorkspaceModal.scss";

interface Props {
  isOpen: boolean;
  defaultWorkspaceType?: WorkspaceType;
  toggleModal: () => void;
  callback?: () => void;
}

export const CreateWorkspaceModalOld: React.FC<Props> = ({ isOpen, defaultWorkspaceType, toggleModal, callback }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState(defaultWorkspaceType || WorkspaceType.SHARED);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotifyAllSelected, setIsNotifyAllSelected] = useState(false);

  const handlePostTeamCreationStep = useCallback(
    (teamId: string, newTeamName: string, hasMembersInSameDomain: boolean) => {
      switchWorkspace(
        {
          teamId: teamId,
          teamName: newTeamName,
          teamMembersCount: 1,
          workspaceType,
        },
        dispatch,
        {
          isSyncEnabled: workspaceType === WorkspaceType.SHARED ? user?.details?.isSyncEnabled : true,
          isWorkspaceMode: isSharedWorkspaceMode,
        },
        appMode,
        null,
        "create_workspace_modal"
      );
      if (workspaceType === WorkspaceType.SHARED) {
        redirectToTeam(navigate, teamId, {
          state: {
            isNewTeam: !isNotifyAllSelected || !hasMembersInSameDomain,
          },
        });
      }
    },
    [
      dispatch,
      appMode,
      isNotifyAllSelected,
      isSharedWorkspaceMode,
      navigate,
      user?.details?.isSyncEnabled,
      workspaceType,
    ]
  );

  const handleDomainInvitesCreation = useCallback(
    async (
      teamId: string,
      domain: string,
      billingTeams: any,
      createOrgTeamInvite: any,
      upsertTeamCommonInvite: any,
      isNotifyAllSelected: boolean
    ): Promise<boolean> => {
      const inviteRes: any = await createOrgTeamInvite({ domain, teamId });
      await upsertTeamCommonInvite({ teamId, domainEnabled: isNotifyAllSelected });

      if (inviteRes.data.success) {
        toast.success(`All users from ${domain} have been invited to join this workspace.`);
        trackAddTeamMemberSuccess({
          team_id: teamId,
          email: user?.details?.profile?.email,
          is_admin: true,
          source: "notify_all_teammates",
          num_users_added: 1,
          workspace_type: isWorkspaceMappedToBillingTeam(teamId, billingTeams)
            ? TEAM_WORKSPACES.WORKSPACE_TYPE.MAPPED_TO_BILLING_TEAM
            : TEAM_WORKSPACES.WORKSPACE_TYPE.NOT_MAPPED_TO_BILLING_TEAM,
        });
        return true;
      }

      if (inviteRes.data.errCode === "no-users-in-same-domain") {
        return false;
      }

      toast.error(`Could not invite all users from ${domain}.`);
      return true;
    },
    [user?.details?.profile?.email]
  );

  const handleTeamWorkspaceCreation = useCallback(async () => {
    if (!workspaceName.length) return;
    setIsLoading(true);
    const functions = getFunctions();
    const createTeam = httpsCallable<CreateTeamParams, { teamId: string }>(functions, "teams-createTeam");
    const createOrgTeamInvite = httpsCallable(functions, "invites-createOrganizationTeamInvite");
    const upsertTeamCommonInvite = httpsCallable(functions, "invites-upsertTeamCommonInvite");

    const config = { type: WorkspaceType.SHARED } as SharedOrPrivateWorkspaceConfig;

    try {
      const teamId = await (async () => {
        const response: any = await createTeam({
          teamName: workspaceName,
          config,
        });
        return response.data.teamId;
      })();

      trackNewTeamCreateSuccess(teamId, workspaceName, "create_workspace_modal", workspaceType);
      toast.info("Workspace Created");

      let hasMembersInSameDomain = true;
      if (isNotifyAllSelected && workspaceType === WorkspaceType.SHARED) {
        try {
          const domain = getDomainFromEmail(user?.details?.profile?.email);
          hasMembersInSameDomain = await handleDomainInvitesCreation(
            teamId,
            domain,
            billingTeams,
            createOrgTeamInvite,
            upsertTeamCommonInvite,
            isNotifyAllSelected
          );
        } catch (error) {
          toast.error(`Could not invite all users from ${getDomainFromEmail(user?.details?.profile?.email)}.`);
        }
      }

      trackNewTeamCreateSuccess(teamId, workspaceName, "create_workspace_modal", workspaceType, isNotifyAllSelected);
      handlePostTeamCreationStep(teamId, workspaceName, hasMembersInSameDomain);

      callback?.();
      toggleModal();
    } catch (err) {
      toast.error(err?.message || "Unable to Create Team");
      Sentry.captureException("Create Team Failure", {
        extra: {
          message: err.message,
        },
      });
      trackNewTeamCreateFailure(workspaceName, workspaceType);
    } finally {
      setIsLoading(false);
    }
  }, [
    billingTeams,
    callback,
    isNotifyAllSelected,
    toggleModal,
    user?.details?.profile?.email,
    workspaceName,
    handlePostTeamCreationStep,
    handleDomainInvitesCreation,
    workspaceType,
  ]);

  return (
    <Modal
      width={640}
      title={
        <div className="modal-title-container">
          <div className="title">Create a new workspace</div>
          <div className="description">Workspaces are where your team collaborate on rules, variables, and mocks.</div>
        </div>
      }
      open={isOpen}
      onCancel={toggleModal}
      className="custom-rq-modal create-workspace-modal-old"
      footer={
        <>
          <RQButton onClick={toggleModal}>Cancel</RQButton>
          <RQButton
            type="primary"
            disabled={!workspaceName.length}
            loading={isLoading}
            onClick={handleTeamWorkspaceCreation}
          >
            Create workspace
          </RQButton>
        </>
      }
    >
      <label htmlFor="workspace-name" className="create-workspace-modal-label">
        Workspace name
      </label>
      <Input
        id="workspace-name"
        className="workspace-name-input"
        placeholder="Workspace name"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
      />
      <div className="workspace-type-selector-container">
        <label className="create-workspace-modal-label">Workspace type</label>
        <div className="workspace-type-selector">
          <Radio.Group
            value={workspaceType}
            onChange={(e) => setWorkspaceType(e.target.value)}
            options={[
              {
                disabled: !user.loggedIn,
                value: WorkspaceType.SHARED,
                label: (
                  <div className="workspace-type-content">
                    <div className="workspace-type-content_title">Team workspace</div>
                    <div className="workspace-type-content_description">
                      Team Workspaces enables real-time collaboration on rules, APIs, and mocks, ensuring seamless
                      teamwork.
                    </div>
                    {workspaceType === WorkspaceType.SHARED ? (
                      <div className="invite-all-domain-users-container">
                        <Checkbox
                          checked={isNotifyAllSelected}
                          onChange={(e) => setIsNotifyAllSelected(e.target.checked)}
                          style={{ alignSelf: "flex-start" }}
                        />
                        <span className="invite-all-domain-users-text">
                          Notify all{" "}
                          <span className="text-white text-bold">
                            {getDomainFromEmail(user?.details?.profile?.email)}
                          </span>{" "}
                          users to join this workspace.
                        </span>
                      </div>
                    ) : null}
                  </div>
                ),
              },
            ]}
          ></Radio.Group>
        </div>
      </div>
    </Modal>
  );
};
