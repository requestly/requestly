import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Team, TeamRole } from "types";

export const useCurrentWorkspaceUserRole = (): TeamRole | undefined => {
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams) as Team[] | null;
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const teamDetails = useMemo(() => availableTeams?.find((team) => team.id === currentlyActiveWorkspace.id), [
    availableTeams,
    currentlyActiveWorkspace.id,
  ]);

  if (!user.loggedIn) {
    return undefined;
  }

  // Private workspace
  if (currentlyActiveWorkspace.id === null) {
    return TeamRole.admin;
  }

  return teamDetails?.members?.[user?.details?.profile?.uid]?.role;
};
