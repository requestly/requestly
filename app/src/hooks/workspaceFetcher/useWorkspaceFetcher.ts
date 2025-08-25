import { useFetchLocalWorkspaces } from "./useFetchLocalWorkspaces";
import { useFetchTeamWorkspaces } from "./useFetchTeamWorkspaces";

export const useWorkspaceFetcher = () => {
  useFetchLocalWorkspaces();
  useFetchTeamWorkspaces();
};
