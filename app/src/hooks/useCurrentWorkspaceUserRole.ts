import { WorkspaceMemberRole, WorkspaceType } from "features/workspaces/types";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";

export const useCurrentWorkspaceUserRole = (): { role: WorkspaceMemberRole | undefined } => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  if (!user.loggedIn) {
    return { role: WorkspaceMemberRole.admin };
  }

  // Private workspace
  if (!activeWorkspace?.id) {
    return { role: WorkspaceMemberRole.admin };
  }

  if (activeWorkspace?.workspaceType === WorkspaceType.LOCAL) {
    return { role: WorkspaceMemberRole.admin };
  }

  const role = activeWorkspace?.members?.[user?.details?.profile?.uid]?.role;
  return { role: role };
};
