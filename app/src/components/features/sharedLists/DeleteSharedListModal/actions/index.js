import { getOwnerId } from "backend/mocks/common";
import { getFunctions, httpsCallable } from "firebase/functions";

//Reducer Actions
import { actions } from "../../../../../store";

export const deleteSharedList = (uid, teamId, sharedListId) => {
  const ownerId = getOwnerId(uid, teamId);
  const functions = getFunctions();
  const removeSharedList = httpsCallable(functions, "sharedLists-delete");
  return removeSharedList({ ownerId, sharedListId });
};

export const refreshPendingStatus = (dispatch) => {
  //Update state: Refresh SharedLists Pending Status
  dispatch(actions.updateRefreshPendingStatus({ type: "sharedLists" }));
};
