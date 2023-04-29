import { getAndUpdateInstallationDate } from "utils/Misc";

export const shouldShowConnectedAppsTour = async (appMode: string) => {
  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  //only show connected apps tour to exisiting users
  if (new Date(installDate) <= new Date("2023-04-18")) return true;
  else return false;
};
