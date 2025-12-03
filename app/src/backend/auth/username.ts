import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore, runTransaction } from "firebase/firestore";
import Logger from "lib/logger";

export const updateUsername = async (uid: string, newUsername: string): Promise<any> => {
  if (!uid) {
    return null;
  }

  const errorMsg = validateUsername(newUsername);
  if (errorMsg) {
    throw Error(errorMsg);
  }

  newUsername = newUsername.toLowerCase();

  const db = getFirestore(firebaseApp);
  try {
    const userDocRef = doc(db, "users", uid);

    await runTransaction(db, async (transaction) => {
      // check new Username alloted to someone else
      const newUsernameDoc = await transaction.get(doc(db, "usernames", newUsername));
      if (newUsernameDoc.exists()) {
        const uid = newUsernameDoc.data()?.uid;
        if (uid) {
          throw Error("username already in use");
        }
      }

      // Get current username
      let currentUsername: string | null = null;
      const userDoc = await transaction.get(userDocRef);
      if (userDoc.exists()) {
        currentUsername = userDoc.data()?.username;
      }

      // Check current username belongs to user
      if (currentUsername) {
        const currentUsernameDoc = await transaction.get(doc(db, "usernames", currentUsername));
        if (currentUsernameDoc.exists()) {
          if (currentUsernameDoc.data()?.uid === uid) {
            // Remove old mapping of username
            transaction.set(doc(db, "usernames", currentUsername), { uid: null }, { merge: true });
          } else {
            // Do Nothing. Do not unlink old username
          }
        }
      }

      // Assign new username
      transaction.set(userDocRef, { username: newUsername }, { merge: true });
      transaction.set(doc(db, "usernames", newUsername), { uid: uid }, { merge: true });
    });
  } catch (e) {
    Logger.error("Error while updating new username");
    throw e;
  }
};

export const getUsername = async (uid: string): Promise<string | null> => {
  if (!uid) {
    return null;
  }

  const db = getFirestore(firebaseApp);

  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  let username: string | null = null;
  if (userDoc.exists()) {
    username = userDoc.data()?.username;
  }

  return username;
};

/**
 *
 * @param username username for which to check
 * @returns (boolean) whether the username is linked to someone or not true/false
 */
export const getUsernameStatus = async (username: string): Promise<boolean> => {
  if (!username) {
    return false;
  }

  const db = getFirestore(firebaseApp);

  const usernameDocRef = doc(db, "usernames", username);
  const usernameDoc = await getDoc(usernameDocRef);
  if (usernameDoc.exists()) {
    const uid = usernameDoc.data()?.uid;
    return !!uid;
  }

  return false;
};

export const validateUsername = (username: string) => {
  if (!username || username.length <= 4) {
    return "username must be longer than 4 characters.";
  }

  if (username.length > 20) {
    return "username must be shorter than 20 characters.";
  }

  const pattern = /^[A-Za-z0-9_]+$/;
  if (username.match(pattern)) {
    return null;
  } else {
    return "username can only contain letters, numbers and '_'";
  }
};
