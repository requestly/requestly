import { getAppDetails } from "utils/AppUtils";

export const getLinkWithMetadata = (link) => {
  if (localStorage.getItem("dataCollectionStatus") && localStorage.getItem("dataCollectionStatus") === "disabled")
    return link;

  const { app_version } = getAppDetails();
  const url = new URL(link);
  url.searchParams.set("app_version", app_version);
  return url.toString();
};
