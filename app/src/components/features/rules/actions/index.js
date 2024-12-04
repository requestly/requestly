import { globalActions } from "store/slices/global/slice";

export const unselectAllRecords = (dispatch) => {
  //Unselect All Rules
  dispatch(globalActions.clearSelectedRecords());
};
