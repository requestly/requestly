import { actions } from "store";

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
  clear: boolean
) => {
  if (clear) dispatch(actions.removePersonaUseCase(value));
  else dispatch(actions.updatePersonaUseCase(value));
};
