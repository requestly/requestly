import { getColorFromString } from "utils/getColorFromString";

export const getUniqueColorForWorkspace = (teamId: string, teamName: string) => {
  return getColorFromString(teamId + teamName);
};
