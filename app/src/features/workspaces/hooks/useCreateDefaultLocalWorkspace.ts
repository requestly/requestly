import { useCallback, useState } from "react";
import { createDefaultWorkspace } from "services/fsManagerServiceAdapter";
import { Workspace, WorkspaceType } from "../types";
import { workspaceActions } from "store/slices/workspaces/slice";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getAppMode } from "store/selectors";
import * as Sentry from "@sentry/react";
import { ErrorCode } from "errors/types";
import { trackNewTeamCreateFailure, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";

interface UseCreateDefaultWorkspaceParams {
  analyticEventSource: string;
  onCreateWorkspaceCallback?: () => void;
  onError?: (error: any) => void;
}

export const useCreateDefaultLocalWorkspace = ({
  analyticEventSource,
  onCreateWorkspaceCallback,
  onError,
}: UseCreateDefaultWorkspaceParams) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const appMode = useSelector(getAppMode);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const handleWorkspaceSwitch = useCallback(
    async (teamId: string, newTeamName: string) => {
      if (activeWorkspace.id === teamId) {
        return;
      }

      await switchWorkspace(
        {
          teamId: teamId,
          teamName: newTeamName,
          teamMembersCount: 1,
          workspaceType: WorkspaceType.LOCAL,
        },
        dispatch,
        {
          isSyncEnabled: true,
          isWorkspaceMode: isSharedWorkspaceMode,
        },
        appMode,
        null,
        analyticEventSource
      );
    },
    [dispatch, appMode, isSharedWorkspaceMode, analyticEventSource, activeWorkspace.id]
  );

  const createWorkspace = useCallback(async () => {
    setIsLoading(true);
    try {
      const workspaceCreationResult = await createDefaultWorkspace();
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
      await handleWorkspaceSwitch(partialWorkspace.id, partialWorkspace.name);
      onCreateWorkspaceCallback?.();
      trackNewTeamCreateSuccess(partialWorkspace.id, partialWorkspace.name, analyticEventSource, WorkspaceType.LOCAL);
    } catch (error) {
      if (error.cause?.code === ErrorCode.EntityAlreadyExists && error.cause.metadata?.workspaceId) {
        await handleWorkspaceSwitch(error.cause.metadata.workspaceId, "Default Workspace");
        onCreateWorkspaceCallback?.();
      } else {
        trackNewTeamCreateFailure("Default Workspace", WorkspaceType.LOCAL);
        onError?.(error);
        Sentry.captureException(error, {
          extra: {
            message: error.message,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, handleWorkspaceSwitch, onCreateWorkspaceCallback, onError, analyticEventSource]);

  return {
    isLoading,
    createWorkspace,
  };
};
