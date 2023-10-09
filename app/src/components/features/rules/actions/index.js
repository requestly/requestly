import { actions } from "../../../../store";

export const unselectAllRecords = (dispatch) => {
  //Unselect All Rules
  dispatch(actions.clearSelectedRecords());
};
