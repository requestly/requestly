import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

export const getUserPersona = async (uid: string) => {
  if (!uid) {
    throw new Error("UID or persona is missing.");
  }

  const db = getFirestore(firebaseApp);
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const persona = data?.persona;
    return persona;
  } else throw new Error("User not found.");
};

export const setUserPersona = async (uid: string, persona: string) => {
  if (!uid || !persona) {
    throw new Error("UID or persona is missing.");
  }

  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  return setDoc(userRef, { persona }, { merge: true })
    .then(() => {
      console.log("Persona set successfully");
      return {
        success: true,
      };
    })
    .catch(() => {
      return {
        success: false,
      };
    });
};

export const updateUserIndustry = async (uid: string, industry: string) => {
  if (!uid || !industry) {
    throw new Error("UID or industry is missing.");
  }

  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  return setDoc(userRef, { industry }, { merge: true })
    .then(() => {
      return {
        success: true,
      };
    })
    .catch(() => {
      return {
        success: false,
      };
    });
};
