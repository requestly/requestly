import { TeamRole } from "types";

export const getDisplayTextForRole = (currentRole: TeamRole = TeamRole.admin) => {
  switch (currentRole) {
    case TeamRole.admin:
      return "Admin";
    case TeamRole.write:
      return "Editor";
    case TeamRole.read:
      return "Viewer";
    default:
      return "Admin";
  }
};
