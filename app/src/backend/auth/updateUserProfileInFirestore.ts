import firebaseApp from "../../firebase";
import { doc, getFirestore, runTransaction } from "firebase/firestore";
import Logger from "lib/logger";

export const updateUserProfileInFirestore = async (
  uid: string,
  updatedProfile: Record<string, unknown>
): Promise<boolean> => {
  if (!uid) {
    return false;
  }

  const db = getFirestore(firebaseApp);
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(doc(db, "users", uid));
      if (userDoc.exists()) {
        transaction.set(doc(db, "users", uid), updatedProfile, { merge: true });
      }

      return true;
    });
    return true;
  } catch (e) {
    Logger.error("Error while updating new username");
    return false;
  }
};
