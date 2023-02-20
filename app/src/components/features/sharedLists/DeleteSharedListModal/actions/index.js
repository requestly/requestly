import { getFunctions, httpsCallable } from "firebase/functions";

//Reducer Actions
import { actions } from "../../../../../store";

export const deleteSharedList = (sharedListId) => {
  const functions = getFunctions();
  const removeSharedList = httpsCallable(functions, "sharedLists-delete");
  return removeSharedList({ sharedListId });
};

export const refreshPendingStatus = (dispatch) => {
  //Update state: Refresh SharedLists Pending Status
  dispatch(actions.updateRefreshPendingStatus({ type: "sharedLists" }));
};
