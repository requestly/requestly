import { UserSubscription } from "models/userSubscription";
import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export const getUserSubscription = async (uid: string): Promise<UserSubscription> => {
  const db = getFirestore(firebaseApp);
  const userSubscriptionDocRef = doc(db, "individualSubscriptions", uid);

  const snapshot = await getDoc(userSubscriptionDocRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as UserSubscription;
    console.log("[debug] data from firestore", data);
    return data;
  } else {
    return null;
  }
};
