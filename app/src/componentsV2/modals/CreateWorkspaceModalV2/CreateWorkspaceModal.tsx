import React, { useCallback, useState } from "react";
import { Checkbox, Input, Modal, Radio, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { CreateTeamParams, LocalWorkspaceConfig, SharedOrPrivateWorkspaceConfig, WorkspaceType } from "types";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { getFunctions, httpsCallable } from "firebase/functions";
import { IncentivizeEvent } from "features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import {
  trackAddTeamMemberSuccess,
  trackNewTeamCreateFailure,
  trackNewTeamCreateSuccess,
} from "modules/analytics/events/features/teams";
import { toast } from "utils/Toast";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import { getAvailableTeams, getIsWorkspaceMode } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { useIncentiveActions } from "features/incentivization/hooks";
import "./createWorkspaceModal.scss";
import { createWorkspaceFolder } from "services/fsManagerServiceAdapter";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  callback?: () => void;
}

export const CreateWorkspaceModal: React.FC<Props> = ({ isOpen, toggleModal, callback }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const availableTeams = useSelector(getAvailableTeams);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState(user.loggedIn ? WorkspaceType.SHARED : WorkspaceType.LOCAL);
  const [folderPath, setFolderPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNotifyAllSelected, setIsNotifyAllSelected] = useState(false);

  const { claimIncentiveRewards } = useIncentiveActions();

  const folderSelectCallback = (path: string) => {
    setFolderPath(path);
  };

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
          isSyncEnabled: user?.details?.isSyncEnabled,
          isWorkspaceMode,
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
    [dispatch, appMode, isNotifyAllSelected, isWorkspaceMode, navigate, user?.details?.isSyncEnabled, workspaceType]
  );

  const handleIncentiveRewards = useCallback(
    async (availableTeamsLength: number, dispatch: any) => {
      const response = await claimIncentiveRewards({
        type: IncentivizeEvent.TEAM_WORKSPACE_CREATED,
        metadata: { num_workspaces: availableTeamsLength || 1 },
      });

      if (response?.data?.success) {
        dispatch(
          incentivizationActions.setUserMilestoneAndRewardDetails({
            userMilestoneAndRewardDetails: response.data?.data,
          })
        );

        dispatch(
          incentivizationActions.toggleActiveModal({
            modalName: IncentivizationModal.TASK_COMPLETED_MODAL,
            newValue: true,
            newProps: { event: IncentivizeEvent.TEAM_WORKSPACE_CREATED },
          })
        );
      }
    },
    [claimIncentiveRewards]
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

    const config =
      workspaceType === WorkspaceType.LOCAL
        ? ({ type: WorkspaceType.LOCAL, rootPath: folderPath } as LocalWorkspaceConfig)
        : ({ type: WorkspaceType.SHARED } as SharedOrPrivateWorkspaceConfig);

    try {
      if (config.type === WorkspaceType.LOCAL) {
        await createWorkspaceFolder(config.rootPath);
      }

      const response: any = await createTeam({
        teamName: workspaceName,
        config,
      });
      const teamId = response.data.teamId;

      await handleIncentiveRewards(availableTeams?.length, dispatch);

      trackNewTeamCreateSuccess(teamId, workspaceName, "create_workspace_modal");
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

      trackNewTeamCreateSuccess(teamId, workspaceName, "create_workspace_modal", isNotifyAllSelected);
      handlePostTeamCreationStep(teamId, workspaceName, hasMembersInSameDomain);

      callback?.();
      toggleModal();
    } catch (err) {
      console.error("Team creation failed", err);
      toast.error("Unable to Create Team");
      trackNewTeamCreateFailure(workspaceName);
    } finally {
      setIsLoading(false);
    }
  }, [
    availableTeams?.length,
    billingTeams,
    callback,
    dispatch,
    isNotifyAllSelected,
    toggleModal,
    user?.details?.profile?.email,
    workspaceName,
    handleIncentiveRewards,
    handlePostTeamCreationStep,
    handleDomainInvitesCreation,
    workspaceType,
    folderPath,
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
      className="custom-rq-modal create-workspace-modal"
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
              {
                value: WorkspaceType.LOCAL,
                disabled: appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
                label: (
                  <div className="workspace-type-content">
                    <div className="workspace-type-content_title">
                      Local workspace <Tag>BETA</Tag>
                    </div>
                    <div className="workspace-type-content_description">
                      In a Local Workspace, your files are stored on your device. Currently, only API client files are
                      supported.
                    </div>
                    {workspaceType === WorkspaceType.LOCAL ? (
                      <div className="folder-path-selector">
                        {folderPath.length ? (
                          <div className="selected-folder-container">
                            <div className="selected-folder-header">
                              <span>SELECTED LOCATION</span> <IoMdClose onClick={() => setFolderPath("")} />
                            </div>
                            <div className="selected-folder-path">{folderPath}</div>
                          </div>
                        ) : (
                          <>
                            <RQButton
                              disabled={appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP}
                              block
                              type="primary"
                              onClick={() => displayFolderSelector(folderSelectCallback)}
                            >
                              Select a folder
                            </RQButton>
                            <div className="selector-description">A location to store your workspace data.</div>
                          </>
                        )}
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
