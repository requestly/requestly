import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";

interface ResInterface {
  success: boolean;
  message: string;
  data: object;
}

export default function useSlackInviteVisibility() {
  const [visible, setVisible] = useState(false);
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    if (!user.loggedIn) return;
    const showSlackButton = httpsCallable<null, ResInterface>(getFunctions(), "slackConnect-showSlackButton");
    showSlackButton()
      .then((res) => {
        setVisible(Boolean(res?.data?.data));
      })
      .catch((err) => {
        console.error("Error fetching slack invite visibility", err);
      });
  }, [user]);

  return visible;
}
