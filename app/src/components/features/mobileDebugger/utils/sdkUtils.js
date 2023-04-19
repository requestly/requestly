import firebaseApp from "../../../../firebase";
import { where, collection, getFirestore, getDocs } from "firebase/firestore";
import { query } from "firebase/database";
import Logger from "lib/logger";

const db = getFirestore(firebaseApp);

export const getSdkApps = async (uid) => {
  let sdkDetails = [];

  const sdksRef = collection(db, "sdks");
  return await getDocs(query(sdksRef, ...[where("accessIds", "array-contains", uid)])).then((snapshot) => {
    if (snapshot && snapshot.docs) {
      const sdkDetailsDocs = snapshot.docs || [];
      sdkDetails = sdkDetailsDocs.map((doc) => {
        return {
          ...(doc.data() || {}),
          id: doc.id,
        };
      });
      // setUserSdkIds(snapshot.docs.map((doc) => doc.id));
      return sdkDetails;
    }
  });
};

export const isUserUsingAndroidDebugger = async (uid) => {
  if (!uid) return false;
  const sdksRef = collection(db, "sdks");
  return await getDocs(query(sdksRef, where("accessIds", "array-contains", uid), where("ownerId", "==", uid)))
    .then((snapshot) => {
      return !!(snapshot && snapshot.docs.length);
    })
    .catch((err) => {
      Logger.log("Couldn't check if user is using android debugger");
      Logger.log(err);
      return false;
    });
};
