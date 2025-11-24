import React, { useCallback, useState } from "react";
import { CreateTeamParams, LocalWorkspaceConfig, SharedOrPrivateWorkspaceConfig } from "types";
import { SharedWorkspaceCreationView } from "./SharedWorkspaceCreationView/SharedWorkspaceCreationView";
import { LocalWorkspaceCreationView } from "./LocalWorkspaceCreationView/LocalWorkspaceCreationView";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAppMode } from "store/selectors";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/Toast";
import {
  trackAddTeamMemberSuccess,
  trackNewTeamCreateFailure,
  trackNewTeamCreateSuccess,
} from "modules/analytics/events/features/teams";
import { isWorkspaceMappedToBillingTeam } from "features/settings";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { createWorkspaceFolder } from "services/fsManagerServiceAdapter";
import { getFunctions, httpsCallable } from "firebase/functions";
import { workspaceActions } from "store/slices/workspaces/slice";
import { getDomainFromEmail } from "utils/mailCheckerUtils";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import * as Sentry from "@sentry/react";

interface Props {
  workspaceType: WorkspaceType;
  callback?: () => void;
  onCancel: () => void;
  analyticEventSource: string;
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

export const WorkspaceCreationView: React.FC<Props> = ({ workspaceType, analyticEventSource, callback, onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const [isLoading, setIsLoading] = useState(false);
  const billingTeams = useSelector(getAvailableBillingTeams);

  const handlePostTeamCreationStep = useCallback(
    async (teamId: string, newTeamName: string, hasMembersInSameDomain: boolean) => {
      await switchWorkspace(
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
        analyticEventSource
      );
      if (workspaceType === WorkspaceType.SHARED) {
        redirectToTeam(navigate, teamId, {
          state: {
            isNewTeam: hasMembersInSameDomain,
          },
        });
      }
    },
    [
      dispatch,
      appMode,
      isSharedWorkspaceMode,
      navigate,
      user?.details?.isSyncEnabled,
      workspaceType,
      analyticEventSource,
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
              owner: "",
              accessCount: 1,
              adminCount: 1,
              members: {},
              appsumo: undefined,
              workspaceType: WorkspaceType.LOCAL,
              rootPath: partialWorkspace.path,
            };
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
        }

        trackNewTeamCreateSuccess(
          teamId,
          workspaceName,
          analyticEventSource,
          workspaceType,
          args.workspaceType === WorkspaceType.SHARED ? args.isNotifyAllSelected : false
        );

        await handlePostTeamCreationStep(teamId, workspaceName, hasMembersInSameDomain);

        callback?.();
      } catch (err) {
        toast.error(err?.message || "Unable to Create Team");
        Sentry.captureException(err || "Create Team Failure", {
          extra: {
            message: err?.message,
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
      user?.details?.profile?.email,
      handlePostTeamCreationStep,
      handleDomainInvitesCreation,
      workspaceType,
      analyticEventSource,
    ]
  );

  return (
    <>
      {workspaceType === WorkspaceType.SHARED ? (
        <SharedWorkspaceCreationView
          onCreateWorkspaceClick={handleTeamWorkspaceCreation}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      ) : (
        <LocalWorkspaceCreationView
          onCreateWorkspaceClick={handleTeamWorkspaceCreation}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      )}
    </>
  );
};
