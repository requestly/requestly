import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { useSelector } from "react-redux";
import { getAuthInitialization } from "store/selectors";

export const useIsTeamAdmin = (teamId: string): { isLoading: boolean; isTeamAdmin: boolean } => {
  const hasAuthInitialized = useSelector(getAuthInitialization);

  const [isLoading, setIsLoading] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsLoading(true);
    const getIsTeamAdmin = httpsCallable(getFunctions(), "teams-isTeamAdmin");

    getIsTeamAdmin({ teamId })
      .then((res) => {
        //@ts-ignore
        if (res.data?.success) setIsTeamAdmin(res.data?.isAdmin);
      })
      .catch((err) => {
        Logger.log("Error while checking team admin", err);
      })
      .finally(() => setIsLoading(false));
  }, [hasAuthInitialized, teamId]);

  return { isLoading, isTeamAdmin };
};
