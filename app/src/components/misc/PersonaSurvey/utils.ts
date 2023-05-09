import { actions } from "store";
import { getAndUpdateInstallationDate } from "utils/Misc";
import { multipleChoiceOption, Option, UserPersona } from "./types";
import { getValueAsPromise, setValue } from "actions/FirebaseActions";
import PATHS from "config/constants/sub/paths";

export const shouldShowPersonaSurvey = async (appMode: string) => {
  // Don't show persona survey on Browser if user is authenticating from desktop app
  if (window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE)) return false;

  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  if (new Date(installDate) >= new Date("2023-03-06")) return true;
  else return false;
};

export const getFormattedUserUseCases = (useCases: multipleChoiceOption[]) => {
  const result = useCases.map((useCase: multipleChoiceOption) => {
    if (useCase.optionType === "other") return "OTHER:" + useCase.value;
    else return useCase.value;
  });
  return result;
};

export const shuffleOptions = (options: Option[]) => {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
};

export const syncUserPersona = async (uid: string, dispatch: any, userPersona: UserPersona) => {
  const persona: any = await getValueAsPromise(["users", uid, "persona"]);
  if (!persona) {
    setValue(["users", uid, "persona"], { ...userPersona });
  } else {
    dispatch(actions.setUserPersonaData({ ...persona }));
  }
};
