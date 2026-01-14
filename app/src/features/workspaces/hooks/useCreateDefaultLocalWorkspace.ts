import { useCallback, useState } from "react";
import { createDefaultWorkspace } from "services/fsManagerServiceAdapter";
import { Workspace, WorkspaceType } from "../types";
import { workspaceActions } from "store/slices/workspaces/slice";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getAppMode } from "store/selectors";
import * as Sentry from "@sentry/react";
import { ErrorCode } from "errors/types";

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

  const handleWorkspaceSwitch = useCallback(
    async (teamId: string, newTeamName: string) => {
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
    [dispatch, appMode, isSharedWorkspaceMode, analyticEventSource]
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
    } catch (error) {
      if (error.cause && error.cause.code === ErrorCode.EntityAlreadyExists) {
        await handleWorkspaceSwitch(error.cause.metadata.workspaceId, "Default Workspace");
        onCreateWorkspaceCallback?.();
      } else {
        onError?.(error);
        Sentry.captureException(error, {
          extra: {
            message: error.message,
          },
        });
      }
    }
  }, [dispatch, handleWorkspaceSwitch, onCreateWorkspaceCallback, onError]);

  return {
    isLoading,
    createWorkspace,
  };
};
