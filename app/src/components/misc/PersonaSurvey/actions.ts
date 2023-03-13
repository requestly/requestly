import { actions } from "store";
import { multipleChoiceOption } from "./types";

export const setUserPersona = (
  dispatch: any,
  value: string,
  clear: boolean
) => {
  dispatch(actions.updateUserPersona(clear ? "" : value));
};

export const setPersonaReferralChannel = (
  dispatch: any,
  value: string,
  clear: boolean
) => {
  dispatch(actions.updatePersonaReferralChannel(clear ? "" : value));
};

export const setPersonaUseCase = (
  dispatch: any,
  value: string,
  clear: boolean,
  optionType: string
) => {
  if (optionType === "select")
    dispatch(actions.updateSelectedPersonaUseCase({ value, optionType }));
  else dispatch(actions.updateOtherPersonaUseCase({ value, optionType }));
};

export const handleUseCaseActiveOption = (
  key: string | multipleChoiceOption[],
  title: string,
  optionType: "select" | "other"
) => {
  if (typeof key === "object") {
    if (optionType === "other") {
      const otherUserCase = key.find(
        (option: multipleChoiceOption) => option.optionType === "other"
      );
      if (otherUserCase) return true;
      else return false;
    }
    const selectedUseCase = key.find(
      (option: multipleChoiceOption) => option.value === title
    );
    if (selectedUseCase) return true;
    else return false;
  } else return false;
};
