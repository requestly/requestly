import { getFunctions, httpsCallable } from "firebase/functions";

interface EmailTypeResponse {
  type: string;
}

//backend for frontend implementation
export const fetchEmailType = async (email: string): Promise<string> => {
  const checkEmailType = httpsCallable<{ userEmail: string }, EmailTypeResponse>(getFunctions(), "fetchEmailType");
  const result = await checkEmailType({ userEmail: email });
  return result.data.type;
};
