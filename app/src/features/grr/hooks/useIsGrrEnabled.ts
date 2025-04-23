import firebaseApp from "firebase";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const useIsGrrEnabled = () => {
  const user = useSelector(getUserAuthDetails);
  const isLoggedIn = user?.loggedIn;
  const uid = user?.details?.profile?.uid;
  const [isGrrEnabled, setIsGrrEnabled] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !uid) {
      setIsGrrEnabled(false);
      return;
    }

    const db = getFirestore(firebaseApp);
    const unsubscribeListener = onSnapshot(doc(db, "users", uid), (doc) => {
      if (doc.exists()) {
        const userDetails = doc.data();
        const isGrrBlocked = !!userDetails?.["block-config"]?.grr?.isBlocked;
        setIsGrrEnabled(isGrrBlocked);
      }
    });

    return () => {
      unsubscribeListener?.();
    };
  }, [isLoggedIn, uid]);

  return { isGrrEnabled };
};
