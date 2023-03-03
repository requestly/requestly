import { actions } from "store";
import { useCaseOptions } from "./types";

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
  useCase: useCaseOptions[],
  title: string,
  optionType: "select" | "other"
) => {
  if (optionType === "other") {
    const otherUserCase = useCase.find(
      (option) => option.optionType === "other"
    );
    if (otherUserCase) return true;
    else return false;
  }
  const selectedUseCase = useCase.find((option) => option.value === title);
  if (selectedUseCase) return true;
  else return false;
};
