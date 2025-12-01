import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { User } from "../models/users";

export const getUser = async (userId: string): Promise<User | undefined> => {
  if (!userId) {
    return undefined;
  }

  const user = await getUserFromFirebase(userId);

  return user;
};

const getUserFromFirebase = async (userId: string): Promise<User | undefined> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "users", userId);

  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as User;
    return data;
  } else {
    return undefined;
  }
};
