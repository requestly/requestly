import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useCallback, useState } from "react";
import { openExistingLocalWorkspace } from "services/fsManagerServiceAdapter";
import { WorkspaceType } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getAppMode } from "store/selectors";
import { ErrorCode } from "errors/types";
import { workspaceActions } from "store/slices/workspaces/slice";
import * as Sentry from "@sentry/react";
import { FileSystemError } from "features/apiClient/helpers/modules/sync/local/services/types";

interface UseOpenLocalWorkspaceParams {
  analyticEventSource: string;
  onOpenWorkspaceCallback?: () => void;
  onError?: (error: FileSystemError) => void;
}

export const useOpenLocalWorkspace = ({
  analyticEventSource,
  onOpenWorkspaceCallback,
  onError,
}: UseOpenLocalWorkspaceParams) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

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

  const openWorkspace = useCallback(
    async (workspacePath: string) => {
      try {
        setIsLoading(true);
        const openWorkspaceResult = await openExistingLocalWorkspace(workspacePath);

        if (openWorkspaceResult.type === "error") {
          if (openWorkspaceResult.error.code === ErrorCode.EntityAlreadyExists) {
            if (openWorkspaceResult.error.metadata) {
              await handleWorkspaceSwitch(
                openWorkspaceResult.error.metadata.workspaceId,
                openWorkspaceResult.error.metadata.name
              );
              onOpenWorkspaceCallback?.();
              return;
            }
            throw new Error("Something went wrong while opening the workspace");
          }
          throw new Error(openWorkspaceResult.error.message, { cause: openWorkspaceResult });
        }

        const workspace = openWorkspaceResult.content;
        dispatch(workspaceActions.upsertWorkspace(workspace));
        await handleWorkspaceSwitch(workspace.id, workspace.name);
        onOpenWorkspaceCallback?.();
      } catch (error) {
        onError?.(error.cause);
        Sentry.captureException(error, {
          extra: {
            message: error.cause?.message,
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, handleWorkspaceSwitch, onOpenWorkspaceCallback, onError]
  );

  return {
    isLoading,
    openWorkspace,
  };
};
