import { actions } from "store";

export const setUserPersona = (dispatch: any, value: string) => {
  dispatch(actions.updateUserPersona(value));
};
