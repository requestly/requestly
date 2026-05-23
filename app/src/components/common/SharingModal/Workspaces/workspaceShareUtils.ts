import type { Workspace } from "features/workspaces/types";

export const WORKSPACE_COPY_ERROR_MESSAGE = "Could not copy rules to the selected workspace.";
export const WORKSPACE_INVITE_ERROR_MESSAGE = "Could not send workspace invites.";

interface ExecuteWorkspaceShareActionOptions {
  action: () => Promise<unknown>;
  errorMessage: string;
  onError: (message: string) => void;
  onSuccess: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

type UserFacingError = Error & {
  userFacingMessage?: string;
};

export const isWorkspaceShareDropdownEnabled = (shareableWorkspaces: Pick<Workspace, "id">[] = []): boolean =>
  shareableWorkspaces.length > 1;

export const executeWorkspaceShareAction = async ({
  action,
  errorMessage,
  onError,
  onSuccess,
  setIsLoading,
}: ExecuteWorkspaceShareActionOptions): Promise<void> => {
  setIsLoading(true);

  try {
    await action();
    onSuccess();
  } catch (error) {
    const userFacingMessage = (error as UserFacingError)?.userFacingMessage;
    onError(userFacingMessage || errorMessage);
  } finally {
    setIsLoading(false);
  }
};
