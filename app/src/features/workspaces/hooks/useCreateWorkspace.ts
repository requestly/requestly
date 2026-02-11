import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as Sentry from "@sentry/react";

import { CreateTeamParams } from "types";
import { Workspace, WorkspaceType } from "features/workspaces/types";

import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAppMode } from "store/selectors";
import { getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";

import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { redirectToTeam } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { getDomainFromEmail } from "utils/mailCheckerUtils";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { createWorkspaceFolder } from "services/fsManagerServiceAdapter";

import {
  trackAddTeamMemberSuccess,
  trackNewTeamCreateFailure,
  trackNewTeamCreateSuccess,
} from "modules/analytics/events/features/teams";
import { getWorkspaceInfo, useWorkspaceViewActions } from "features/apiClient/slices";
import { InvalidContextVersionError } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";

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

interface UseCreateWorkspaceParams {
  analyticEventSource: string;
  onCreateWorkspaceCallback?: () => void;
  onError?: (error: any) => void;
}

export const useCreateWorkspace = ({
  analyticEventSource,
  onCreateWorkspaceCallback,
  onError,
}: UseCreateWorkspaceParams) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userId = user?.details?.profile?.uid;
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const { switchContext } = useWorkspaceViewActions();

  const [isLoading, setIsLoading] = useState(false);

  const handlePostTeamCreationStep = useCallback(
    async (workspace: Workspace, hasMembersInSameDomain: boolean) => {
      const { workspaceType } = workspace;

      if (activeWorkspace.id === workspace.id) {
        return;
      }

      await switchWorkspace(
        {
          teamId: workspace.id,
          teamName: workspace.name,
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
        analyticEventSource
      );

      const result = await switchContext({
        userId,
        workspace: getWorkspaceInfo(workspace),
      });

      if (result.payload?.error) {
        if (result.payload.error.name === InvalidContextVersionError.name) {
          return;
        } else {
          const error = result.payload?.error;
          throw new NativeError(error.message as string)
            .setShowBoundary(true)
            .setSeverity(ErrorSeverity.FATAL)
            .set("stack", error.stack);
        }
      }

      if (workspaceType === WorkspaceType.SHARED) {
        redirectToTeam(navigate, workspace.id, {
          state: {
            isNewTeam: hasMembersInSameDomain,
          },
        });
      }
    },
    [
      WorkspaceType,
      dispatch,
      user?.details?.isSyncEnabled,
      isSharedWorkspaceMode,
      appMode,
      analyticEventSource,
      switchContext,
      userId,
      navigate,
    ]
  );

  const handleDomainInvitesCreation = useCallback(
    async (
      teamId: string,
      domain: string,
      billingTeamsParam: any,
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
          workspace_type: isWorkspaceMappedToBillingTeam(teamId, billingTeamsParam)
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

  const createWorkspace = useCallback(
    async (createWorkspaceArgs: CreateWorkspaceArgs) => {
      const { workspaceName, ...args } = createWorkspaceArgs;
      if (!workspaceName.length) return;
      setIsLoading(true);
      const functions = getFunctions();
      const createTeam = httpsCallable<CreateTeamParams, { teamId: string }>(functions, "teams-createTeam");
      const createOrgTeamInvite = httpsCallable(functions, "invites-createOrganizationTeamInvite");
      const upsertTeamCommonInvite = httpsCallable(functions, "invites-upsertTeamCommonInvite");

      try {
        const workspace = await (async () => {
          if (args.workspaceType === WorkspaceType.LOCAL) {
            const workspaceCreationResult = await createWorkspaceFolder(workspaceName, args.folderPath);
            if (workspaceCreationResult.type === "error") {
              throw new Error(workspaceCreationResult.error.message, { cause: workspaceCreationResult.error });
            }
            const partialWorkspace = workspaceCreationResult.content;
            const localWorkspace: Workspace = {
              id: partialWorkspace.id,
              name: partialWorkspace.name,
              owner: "",
              accessCount: 1,
              adminCount: 1,
              members: {},
              appsumo: undefined,
              workspaceType: WorkspaceType.LOCAL,
              rootPath: partialWorkspace.path,
            };
            dispatch(workspaceActions.upsertWorkspace(localWorkspace));
            return localWorkspace;
          } else {
            const response: any = await createTeam({
              teamName: workspaceName,
              config: {
                type: WorkspaceType.SHARED,
              },
            });

            const workspace: Workspace & { workspaceType: WorkspaceType.SHARED } = {
              id: response.data.teamId,
              name: workspaceName,
              workspaceType: WorkspaceType.SHARED,
            };

            return workspace;
          }
        })();
        const teamId = workspace.id;
        toast.info("Workspace Created");

        let hasMembersInSameDomain = true;
        if (args.workspaceType === WorkspaceType.SHARED && args.isNotifyAllSelected) {
          try {
            const domain = getDomainFromEmail(user?.details?.profile?.email || "") || "";
            hasMembersInSameDomain = await handleDomainInvitesCreation(
              teamId,
              domain,
              billingTeams,
              createOrgTeamInvite,
              upsertTeamCommonInvite,
              args.isNotifyAllSelected
            );
          } catch (error) {
            toast.error(`Could not invite all users from ${getDomainFromEmail(user?.details?.profile?.email || "")}.`);
          }
        }

        const isNotifyAllSelected = args.workspaceType === WorkspaceType.SHARED ? args.isNotifyAllSelected : false;

        trackNewTeamCreateSuccess(teamId, workspaceName, analyticEventSource, args.workspaceType, isNotifyAllSelected);

        await handlePostTeamCreationStep(workspace, hasMembersInSameDomain);

        onCreateWorkspaceCallback?.();
      } catch (err: any) {
        onError?.(err);
        Sentry.captureException(err || "Create Team Failure", {
          extra: {
            message: err?.message,
          },
        });
        trackNewTeamCreateFailure(workspaceName, args.workspaceType);
      } finally {
        setIsLoading(false);
      }
    },
    [
      analyticEventSource,
      billingTeams,
      onCreateWorkspaceCallback,
      dispatch,
      handleDomainInvitesCreation,
      handlePostTeamCreationStep,
      user?.details?.profile?.email,
      onError,
    ]
  );

  return {
    isLoading,
    createWorkspace,
  };
};
