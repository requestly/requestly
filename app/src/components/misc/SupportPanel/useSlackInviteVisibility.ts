import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";

export default function useFetchSlackInviteVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    if (!user.loggedIn) {
      setIsVisible(false);
      return;
    }
    const showSlackButton = httpsCallable(getFunctions(), "slackConnect-showSlackButton");
    showSlackButton()
      .then((res) => {
        setIsVisible(Boolean(res?.data));
      })
      .catch((err) => {
        console.error("Error fetching slack invite visibility", err);
        setIsVisible(false);
      });
  }, [user.loggedIn]);

  return isVisible;
}
