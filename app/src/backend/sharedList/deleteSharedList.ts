import { getFunctions, httpsCallable } from "firebase/functions";

export const deleteSharedList = (sharedListId: string) => {
  const functions = getFunctions();
  const removeSharedList = httpsCallable(functions, "sharedLists-delete");
  return removeSharedList({ sharedListId });
};
