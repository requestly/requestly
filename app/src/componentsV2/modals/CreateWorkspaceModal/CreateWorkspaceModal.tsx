import React, { useCallback, useState } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import * as Sentry from "@sentry/react";

import { getAppMode } from "store/selectors";
import { CreateTeamParams, LocalWorkspaceConfig, SharedOrPrivateWorkspaceConfig, WorkspaceType } from "types";

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
import { createWorkspaceFolder } from "services/fsManagerServiceAdapter";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";
import { Workspace, WorkspaceMemberRole } from "features/workspaces/types";
import { SharedWorkspaceCreationView } from "./components/SharedWorkspaceCreationView/SharedWorkspaceCreationView";
import { LocalWorkspaceCreationView } from "./components/LocalWorkspaceCreationView/LocalWorkspaceCreationView";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./createWorkspaceModal.scss";

interface Props {
  isOpen: boolean;
  workspaceType?: WorkspaceType;
  toggleModal: () => void;
  callback?: () => void;
}

export type CreateWorkspaceArgs = {
  workspaceName: string;
} & (
  | {
      workspaceType: WorkspaceType.SHARED;
      isNotifyAllSelected: boolean;
    }
  | {
      workspaceType: WorkspaceType.LOCAL;
      folderPath: string;
    }
);

export const CreateWorkspaceModal: React.FC<Props> = ({
  isOpen,
  toggleModal,
  callback,
  workspaceType = WorkspaceType.SHARED,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [isLoading, setIsLoading] = useState(false);

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
          isWorkspaceMode: isSharedWorkspaceMode,
        },
        appMode,
        null,
        "create_workspace_modal"
      );
      if (workspaceType === WorkspaceType.SHARED) {
        redirectToTeam(navigate, teamId, {
          state: {
            isNewTeam: hasMembersInSameDomain,
          },
        });
      }
    },
    [dispatch, appMode, isSharedWorkspaceMode, navigate, user?.details?.isSyncEnabled, workspaceType]
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

  const handleTeamWorkspaceCreation = useCallback(
    async (createWorkspaceArgs: CreateWorkspaceArgs) => {
      const { workspaceName, ...args } = createWorkspaceArgs;
      if (!workspaceName.length) return;
      setIsLoading(true);
      const functions = getFunctions();
      const createTeam = httpsCallable<CreateTeamParams, { teamId: string }>(functions, "teams-createTeam");
      const createOrgTeamInvite = httpsCallable(functions, "invites-createOrganizationTeamInvite");
      const upsertTeamCommonInvite = httpsCallable(functions, "invites-upsertTeamCommonInvite");

      const config =
        args.workspaceType === WorkspaceType.LOCAL
          ? ({ type: WorkspaceType.LOCAL, rootPath: args.folderPath } as LocalWorkspaceConfig)
          : ({ type: WorkspaceType.SHARED } as SharedOrPrivateWorkspaceConfig);

      try {
        const teamId = await (async () => {
          if (config.type === WorkspaceType.LOCAL) {
            const workspaceCreationResult = await createWorkspaceFolder(workspaceName, config.rootPath);
            if (workspaceCreationResult.type === "error") {
              throw new Error(workspaceCreationResult.error.message);
            }
            const partialWorkspace = workspaceCreationResult.content;
            const localWorkspace: Workspace = {
              id: partialWorkspace.id,
              name: partialWorkspace.name,
              owner: user?.details?.profile?.uid,
              accessCount: 1,
              adminCount: 1,
              members: {
                [user?.details?.profile?.uid]: {
                  role: WorkspaceMemberRole.admin,
                },
              },
              appsumo: null,
              workspaceType: WorkspaceType.LOCAL,
              rootPath: partialWorkspace.path,
            };
            dispatch(workspaceActions.setAllWorkspaces([localWorkspace]));
            dispatch(workspaceActions.upsertWorkspace(localWorkspace));
            return partialWorkspace.id;
          } else {
            const response: any = await createTeam({
              teamName: workspaceName,
              config,
            });
            return response.data.teamId;
          }
        })();

        trackNewTeamCreateSuccess(teamId, workspaceName, "create_workspace_modal", workspaceType);
        toast.info("Workspace Created");

        let hasMembersInSameDomain = true;
        if (args.workspaceType === WorkspaceType.SHARED && args.isNotifyAllSelected) {
          try {
            const domain = getDomainFromEmail(user?.details?.profile?.email);
            hasMembersInSameDomain = await handleDomainInvitesCreation(
              teamId,
              domain,
              billingTeams,
              createOrgTeamInvite,
              upsertTeamCommonInvite,
              args.isNotifyAllSelected
            );
          } catch (error) {
            toast.error(`Could not invite all users from ${getDomainFromEmail(user?.details?.profile?.email)}.`);
          }
          trackNewTeamCreateSuccess(
            teamId,
            workspaceName,
            "create_workspace_modal",
            workspaceType,
            args.isNotifyAllSelected
          );
        }

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
    },
    [
      billingTeams,
      callback,
      dispatch,
      toggleModal,
      user?.details?.profile?.email,
      handlePostTeamCreationStep,
      handleDomainInvitesCreation,
      workspaceType,
      user?.details?.profile?.uid,
    ]
  );

  return (
    <Modal
      width={workspaceType === WorkspaceType.SHARED ? 480 : 560}
      open={isOpen}
      onCancel={toggleModal}
      className="custom-rq-modal create-workspace-modal"
      footer={null}
      closable={false}
    >
      <MdClose className="create-workspace-modal__close-icon" onClick={toggleModal} />
      {workspaceType === WorkspaceType.SHARED ? (
        <SharedWorkspaceCreationView onCreateWorkspaceClick={handleTeamWorkspaceCreation} isLoading={isLoading} />
      ) : (
        <LocalWorkspaceCreationView onCreateWorkspaceClick={handleTeamWorkspaceCreation} isLoading={isLoading} />
      )}
    </Modal>
  );
};
