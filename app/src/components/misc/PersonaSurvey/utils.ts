import { getAndUpdateInstallationDate } from "utils/Misc";
import { useCaseOptions } from "./types";

export const shouldShowPersonaSurvey = async (appMode: string) => {
  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  if (new Date(installDate) >= new Date("2023-03-06")) return true;
  else return false;
};

export const getFormattedUserUseCases = (useCases: useCaseOptions[]) => {
  const result = useCases.map((useCase: useCaseOptions) => {
    if (useCase.optionType === "other") return "OTHER:" + useCase.value;
    else return useCase.value;
  });
  return result;
};
