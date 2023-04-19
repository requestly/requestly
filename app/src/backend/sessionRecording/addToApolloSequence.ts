import { getFunctions, httpsCallable } from "firebase/functions";

export const addToApolloSequence = (email: string) => {
  const functions = getFunctions();
  const addToSequence = httpsCallable(functions, "sessionRecording-addToApolloSequence");

  addToSequence({ email }).then((res: any) => {
    if (res?.data?.success) {
      return;
    }
  });
};
