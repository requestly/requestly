import { actions } from "store";

export const setUserPersona = (dispatch: any, value: string) => {
  dispatch(actions.updateUserPersona(value));
};

export const setPersonaReferralChannel = (dispatch: any, value: string) => {
  dispatch(actions.updatePersonaReferralChannel(value));
};

export const setPersonaUseCase = (dispatch: any, value: string) => {
  dispatch(actions.updatePersonaUseCase(value));
};
