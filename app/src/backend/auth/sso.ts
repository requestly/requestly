import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Logger from "lib/logger";

export const getSSOProviderId = async (email: string) => {
  try {
    const domain = email.split("@")[1];

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "sso", domain);

    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return data?.providerId;
    } else {
      return null;
    }
  } catch (err) {
    Logger.error("Error fetching SSO provider ID:", err);
    return null;
  }
};
