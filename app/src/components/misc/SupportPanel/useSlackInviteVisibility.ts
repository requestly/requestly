import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsSlackConnectButtonVisible } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isVerifiedBusinessDomainUser } from "utils/Misc";

export default function useFetchSlackInviteVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector(getUserAuthDetails);
  const isSlackConnectButtonVisible = useSelector(getIsSlackConnectButtonVisible);

  useEffect(() => {
    if (!isSlackConnectButtonVisible) {
      setIsVisible(false);
      return;
    }

    if (!user.loggedIn) {
      setIsVisible(false);
      return;
    }
    isVerifiedBusinessDomainUser(user.details.profile.email, user.details.profile.uid)
      .then((isBusinessDomainUser) => {
        setIsVisible(isBusinessDomainUser);
      })
      .catch(() => {
        setIsVisible(false);
      });
  }, [user.loggedIn, user.details?.profile?.email, user.details?.profile?.uid, isSlackConnectButtonVisible]);

  return isVisible;
}
