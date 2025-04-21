import { getUser } from "backend/user/getUser";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const useIsGrrEnabled = () => {
  const user = useSelector(getUserAuthDetails);
  const [isGrrEnabled, setIsGrrEnabled] = useState(false);

  const isLoggedIn = user?.loggedIn;
  const uid = user?.details?.profile?.uid;

  useEffect(() => {
    if (!isLoggedIn) {
      setIsGrrEnabled(false);
      return;
    }

    if (!uid) {
      setIsGrrEnabled(false);
      return;
    }

    getUser(uid).then((profile) => {
      if (profile?.["block-config"]?.grr?.isBlocked) {
        setIsGrrEnabled(true);
      }
    });
  }, [uid, isLoggedIn]);

  return { isGrrEnabled };
};
