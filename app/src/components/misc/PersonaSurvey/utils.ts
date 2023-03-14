import { getAndUpdateInstallationDate } from "utils/Misc";
import { multipleChoiceOption, Option } from "./types";

export const shouldShowPersonaSurvey = async (appMode: string) => {
  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  if (new Date(installDate) >= new Date("2020-03-06")) return true;
  else return false;
};

export const getFormattedUserUseCases = (useCases: multipleChoiceOption[]) => {
  const result = useCases.map((useCase: multipleChoiceOption) => {
    if (useCase.optionType === "other") return "OTHER:" + useCase.value;
    else return useCase.value;
  });
  return result;
};

export const shuffleOptions = (arr: Option[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};
