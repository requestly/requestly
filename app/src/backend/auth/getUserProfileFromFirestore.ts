import firebaseApp from "firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export const getUserProfileFromFirestore = async (uid: string): Promise<unknown | null> => {
  if (!uid) {
    return null;
  }

  const db = getFirestore(firebaseApp);

  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  let profile: unknown = null;
  if (userDoc.exists()) {
    profile = userDoc.data();
  }

  return profile;
};
