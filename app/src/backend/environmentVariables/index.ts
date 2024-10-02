import firebaseApp from "firebase";
import { doc, getFirestore, setDoc } from "firebase/firestore";

export const setEnvironmentVariable = async (
  ownerId: string,
  payload: {
    newVariable: {
      key: string;
      value: string | number | boolean;
    };
    environment: string;
  }
) => {
  const db = getFirestore(firebaseApp);
  console.log("!!!debug", "setenvVar", ownerId, payload);

  await setDoc(
    doc(db, "environmentVariables", ownerId),
    {
      [payload.environment]: {
        [payload.newVariable.key]: payload.newVariable.value,
      },
    },
    { merge: true }
  );
};
