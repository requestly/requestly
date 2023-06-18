import PATHS from "config/constants/sub/paths";
import { getAndUpdateInstallationDate } from "utils/Misc";

export const shouldShowWorkspaceOnboarding = async (appMode: string) => {
  // Don't show persona survey on Browser if user is authenticating from desktop app
  if (window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE)) return false;

  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  if (new Date(installDate) >= new Date("2021-06-18")) return true;
  else return false;
};
