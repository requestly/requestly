import { Rule } from "@requestly/shared/types/entities/rules";
import { getFunctions, httpsCallable } from "firebase/functions";

export const sendSharedListImportedEmail = (email: string, url: string, rules: Rule[], sharedListId: string) => {
  const sendSharedListImportAsEmail = httpsCallable(getFunctions(), "sharedLists-sendSharedListImportAsEmail");
  return sendSharedListImportAsEmail({
    email,
    url,
    rules,
    sharedListId,
  });
};
