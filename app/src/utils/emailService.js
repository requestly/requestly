import { getFunctions, httpsCallable } from "firebase/functions";

//backend for frontend implementation
export const fetchEmailType = async (email) => {
  const checkEmailType = httpsCallable(getFunctions(), "fetchEmailType");
  const result = await checkEmailType({ userEmail: email });
  return result.data.type;
};
