import { getUser } from "backend/user/getUser";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const useIsGrr = () => {
  const user = useSelector(getUserAuthDetails);
  const [isGrr, setIsGrr] = useState(false);

  const isLoggedIn = user?.loggedIn;
  const uid = user?.details?.profile?.uid;

  useEffect(() => {
    if (!isLoggedIn) {
      setIsGrr(false);
      return;
    }

    if (!uid) {
      setIsGrr(false);
      return;
    }

    getUser(uid).then((profile) => {
      // TODO: update User type on UI
      // @ts-ignore
      if (profile?.["block-config"]?.grr) {
        setIsGrr(true);
      }
    });
  }, [uid, isLoggedIn]);

  return { isGrr };
};
