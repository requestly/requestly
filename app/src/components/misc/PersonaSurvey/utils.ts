import { getAndUpdateInstallationDate } from "utils/Misc";
import { useCaseOptions } from "./types";

export const isNewInstall = async (appMode: string, isLoggedIn: boolean) => {
  const installDate = await getAndUpdateInstallationDate(
    appMode,
    false,
    isLoggedIn
  );
  //change this date on release
  if (installDate > new Date("2020-01-01")) return true;
  else return false;
};

export const getFormattedUserUseCases = (useCases: useCaseOptions[]) => {
  const result = useCases.map((useCase: useCaseOptions) => {
    if (useCase.optionType === "other") return "OTHER:" + useCase.value;
    else return useCase.value;
  });
  return result;
};
