import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";

export const useActiveWorkspacesMembersListener = () => {
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);

  const dispatch = useDispatch();

  const getWorkspaceMembers = useCallback(
    async (workspaceId: string) => {
      const functions = getFunctions();
      const getTeamUsers = httpsCallable(functions, "teams-getTeamUsers");

      getTeamUsers({
        teamId: workspaceId,
      })
        .then((res) => {
          const response: any = res.data;
          if (response.success) {
            const users: Record<string, any> = {};
            response.users.forEach((user: any, index: number) => {
              users[user.id] = response.users[index];
            });
            dispatch(workspaceActions.updateActiveWorkspacesMembers(users));
          } else {
            throw new Error(response.message);
          }
        })
        .catch((e) => Logger.error(e));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(workspaceActions.setActiveWorkspacesMembers({}));
    activeWorkspaceIds.forEach((workspaceId) => {
      getWorkspaceMembers(workspaceId);
    });
  }, [activeWorkspaceIds, dispatch, getWorkspaceMembers]);
};
